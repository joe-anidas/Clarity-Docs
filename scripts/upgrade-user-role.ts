/**
 * Script to upgrade user roles in Firestore
 * 
 * Usage:
 * 1. Run: npx tsx scripts/upgrade-user-role.ts
 * 2. Follow the prompts to enter user email and desired role
 * 
 * Or use with parameters:
 * npx tsx scripts/upgrade-user-role.ts <email> <role>
 * 
 * Example:
 * npx tsx scripts/upgrade-user-role.ts user@example.com lawyer
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as readline from 'readline';

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

try {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();
const auth = getAuth();

type UserRole = 'user' | 'lawyer' | 'admin';

async function getUserByEmail(email: string) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

async function upgradeUserRole(email: string, role: UserRole) {
  console.log(`\n🔍 Looking up user: ${email}`);
  
  const userRecord = await getUserByEmail(email);
  
  if (!userRecord) {
    console.error(`❌ User not found: ${email}`);
    return false;
  }
  
  console.log(`✅ Found user: ${userRecord.uid}`);
  console.log(`   Display Name: ${userRecord.displayName || 'N/A'}`);
  console.log(`   Email: ${userRecord.email}`);
  
  const userRef = db.collection('users').doc(userRecord.uid);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    console.log(`⚠️  User document doesn't exist in Firestore. Creating...`);
    await userRef.set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`✅ User document created with role: ${role}`);
  } else {
    const currentRole = userDoc.data()?.role || 'user';
    console.log(`   Current Role: ${currentRole}`);
    
    await userRef.update({
      role: role,
      updatedAt: new Date().toISOString(),
    });
    console.log(`✅ Role updated from "${currentRole}" to "${role}"`);
  }
  
  // If upgrading to lawyer, provide instructions for creating lawyer profile
  if (role === 'lawyer') {
    console.log('\n📋 Next Steps for Lawyer Account:');
    console.log('   1. Go to Firebase Console > Firestore Database');
    console.log('   2. Create a document in the "lawyerProfiles" collection');
    console.log(`   3. Use document ID: ${userRecord.uid}`);
    console.log('   4. Add the following fields:');
    console.log('      - userId: ' + userRecord.uid);
    console.log('      - name: (lawyer\'s full name)');
    console.log('      - email: ' + userRecord.email);
    console.log('      - verified: true');
    console.log('      - specializations: ["Contract Law", "Corporate Law"]');
    console.log('      - hourlyRate: 250');
    console.log('      - currency: "USD"');
    console.log('      - yearsOfExperience: 5');
    console.log('      - rating: 4.5');
    console.log('      - reviewCount: 0');
    console.log('      - And other required fields...');
    console.log('\n   Or use the sample lawyers in src/lib/sample-lawyers.ts as a template');
  }
  
  return true;
}

async function promptUser(): Promise<{ email: string; role: UserRole }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\n📧 Enter user email: ', (email) => {
      rl.question('👤 Enter role (user/lawyer/admin): ', (role) => {
        rl.close();
        resolve({ 
          email: email.trim(), 
          role: role.trim().toLowerCase() as UserRole 
        });
      });
    });
  });
}

async function main() {
  console.log('🚀 Clarity-Docs User Role Upgrade Tool\n');
  
  let email: string;
  let role: UserRole;
  
  // Check if command line arguments provided
  if (process.argv.length >= 4) {
    email = process.argv[2];
    role = process.argv[3] as UserRole;
  } else {
    const input = await promptUser();
    email = input.email;
    role = input.role;
  }
  
  // Validate role
  const validRoles: UserRole[] = ['user', 'lawyer', 'admin'];
  if (!validRoles.includes(role)) {
    console.error(`❌ Invalid role: ${role}`);
    console.error(`   Valid roles: ${validRoles.join(', ')}`);
    process.exit(1);
  }
  
  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }
  
  try {
    const success = await upgradeUserRole(email, role);
    if (success) {
      console.log('\n✨ Role upgrade completed successfully!\n');
    } else {
      console.log('\n❌ Role upgrade failed\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error upgrading role:', error);
    process.exit(1);
  }
}

main();
