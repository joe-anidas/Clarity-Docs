"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  User as UserIcon, 
  Scale, 
  ShieldCheck, 
  Loader2, 
  Info,
  Settings as SettingsIcon 
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SettingsPage() {
  const { user, userRole, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  const handleRoleChange = async (newRole: 'user' | 'lawyer') => {
    if (!user || userRole === 'admin') return;
    
    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Role Updated",
        description: `Your role has been changed to ${newRole}. Please refresh the page.`,
      });

      // Refresh the page to update auth state
      window.location.reload();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadge = (role: 'user' | 'lawyer' | 'admin' | null) => {
    if (role === 'admin') {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      );
    }
    if (role === 'lawyer') {
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
          <Scale className="mr-1 h-3 w-3" />
          Lawyer
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        <UserIcon className="mr-1 h-3 w-3" />
        User
      </Badge>
    );
  };

  const getRoleColor = () => {
    if (userRole === 'admin') return 'ring-4 ring-green-500';
    if (userRole === 'lawyer') return 'ring-4 ring-purple-500';
    return 'ring-4 ring-blue-500';
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your profile and role details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className={`h-20 w-20 ${getRoleColor()}`}>
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.displayName || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2">{getRoleBadge(userRole)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Change your account type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {userRole === 'admin' ? (
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                <strong>Admin Account:</strong> You have full access to all features. 
                Admin role cannot be changed from settings.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Switch between User and Lawyer modes based on your needs. 
                  Changes take effect immediately after refresh.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Option */}
                <Card className={`cursor-pointer transition-all ${
                  userRole === 'user' ? 'border-primary border-2' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">User</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-xs">
                      • Upload & analyze documents<br />
                      • Browse lawyers<br />
                      • Request consultations<br />
                      • Real-time chat
                    </CardDescription>
                    {userRole === 'user' ? (
                      <Badge className="w-full justify-center" variant="default">
                        Current Role
                      </Badge>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleRoleChange('user')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Switch to User'
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Lawyer Option */}
                <Card className={`cursor-pointer transition-all ${
                  userRole === 'lawyer' ? 'border-primary border-2' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg">Lawyer</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-xs">
                      • Professional profile<br />
                      • Accept consultations<br />
                      • Lawyer dashboard<br />
                      • Chat with clients
                    </CardDescription>
                    {userRole === 'lawyer' ? (
                      <Badge className="w-full justify-center" variant="default">
                        Current Role
                      </Badge>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleRoleChange('lawyer')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Switch to Lawyer'
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {userRole === 'lawyer' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Note:</strong> If you switch from Lawyer to User, you'll need to create a 
                    lawyer profile again in Firebase Console to switch back. Your profile will not be deleted.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Additional Settings (Future) */}
      <div className="text-center text-sm text-muted-foreground">
        More settings coming soon...
      </div>
    </div>
  );
}
