'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  browserLocalPersistence,
  type User,
  type AuthCredential,
} from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userRole: 'user' | 'lawyer' | 'admin' | null;
  loading: boolean;
  showRoleSelection: boolean;
  pendingUser: User | null;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  selectRole: (role: 'user' | 'lawyer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'lawyer' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Fetch user role from Firestore
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserRole(userData.role || 'user');
          } else {
            setUserRole('user');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const saveUserToDB = async (user: User, newProvider?: string, selectedRole?: 'user' | 'lawyer') => {
    try {
      const providers = [
        ...new Set([
          ...user.providerData.map((p) => p.providerId.replace('.com', '')),
          ...(newProvider ? [newProvider] : []),
        ]),
      ];

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      // Determine role
      let role: 'user' | 'lawyer' | 'admin';
      
      if (userSnap.exists() && userSnap.data().role) {
        // User already exists, keep their current role
        role = userSnap.data().role;
      } else if (user.email === 'joeanidas.26it@licet.ac.in') {
        // Hardcoded admin
        role = 'admin';
      } else if (selectedRole) {
        // New user selected a role
        role = selectedRole;
      } else {
        // Default to user (shouldn't happen with role selection dialog)
        role = 'user';
      }

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providers,
        role,
        updatedAt: new Date().toISOString(),
        ...(userSnap.exists() ? {} : { createdAt: new Date().toISOString() }),
      }, { merge: true });
      
      return { isNewUser: !userSnap.exists(), role };
    } catch (error) {
      console.error('Error saving user to database:', error);
      // Don't throw error - allow auth to continue even if DB save fails
      return { isNewUser: false, role: 'user' as const };
    }
  };

  const handleAccountConflict = async (error: any): Promise<User> => {
    const email: string = error.customData?.email;
    const pendingCred: AuthCredential = error.credential;

    if (!email || !pendingCred) {
      throw new Error('Missing email or credential for account conflict.');
    }

    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (methods.includes(EmailAuthProvider.PROVIDER_ID)) {
      const password = prompt(`An account with ${email} already exists. Enter your password to link accounts:`);

      if (!password) throw new Error('Password is required to link accounts.');

      const result = await signInWithEmailAndPassword(auth, email, password);
      await linkWithCredential(result.user, pendingCred);
      await saveUserToDB(result.user, 'google');
      return result.user;
    } else {
      throw new Error(
        'Account exists with a different authentication method. Please use the correct sign-in method.'
      );
    }
  };
  
  const signOut = async () => {
    await firebaseSignOut(auth);
    setShowRoleSelection(false);
    setPendingUser(null);
    router.push('/');
  };

  const selectRole = async (role: 'user' | 'lawyer') => {
    if (!pendingUser) return;
    
    try {
      const result = await saveUserToDB(pendingUser, undefined, role);
      setShowRoleSelection(false);
      setPendingUser(null);
      
      // Redirect based on role
      if (result.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (result.role === 'lawyer') {
        // Lawyers go directly to their dashboard
        router.push('/dashboard/lawyer');
      } else {
        router.push('/clarity');
      }
    } catch (error) {
      console.error('Error selecting role:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!isMounted) return;
    
    try {
      await auth.setPersistence(browserLocalPersistence);
      const result = await signInWithPopup(auth, googleProvider);

      if (result.user) {
        const userInfo = await saveUserToDB(result.user, 'google');
        
        // If new user and not admin, show role selection
        if (userInfo.isNewUser && userInfo.role !== 'admin') {
          setPendingUser(result.user);
          setShowRoleSelection(true);
          return result;
        }
        
        // Existing user or admin - redirect immediately
        if (userInfo.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (userInfo.role === 'lawyer') {
          // All lawyers go directly to their dashboard
          router.push('/dashboard/lawyer');
        } else {
          router.push('/clarity');
        }
        
        return result;
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle account conflict (email already exists with different method)
      if (error.code === 'auth/account-exists-with-different-credential') {
        const user = await handleAccountConflict(error);
        return { user };
      }
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    await auth.setPersistence(browserLocalPersistence);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserToDB(result.user);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    await auth.setPersistence(browserLocalPersistence);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const value = {
    user,
    userRole,
    loading,
    showRoleSelection,
    pendingUser,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    selectRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
