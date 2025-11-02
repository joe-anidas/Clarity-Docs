/**
 * Script to fix lawyer verification status in Firestore
 * 
 * This script adds the verificationStatus field to existing lawyer profiles
 * that don't have it set. It will set:
 * - 'approved' if verified is true
 * - 'pending' if verified is false
 * 
 * Usage:
 * npx tsx scripts/fix-lawyer-verification-status.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

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
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

async function fixLawyerVerificationStatus() {
  try {
    console.log('\n🔍 Fetching all lawyer profiles...\n');
    
    const lawyerProfilesRef = db.collection('lawyerProfiles');
    const snapshot = await lawyerProfilesRef.get();
    
    if (snapshot.empty) {
      console.log('ℹ️  No lawyer profiles found.');
      return;
    }

    console.log(`📋 Found ${snapshot.size} lawyer profile(s)\n`);
    
    let updatedCount = 0;
    let alreadySetCount = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const lawyerId = doc.id;
      
      // Check if verificationStatus is already set
      if (data.verificationStatus) {
        console.log(`✓ ${data.name || lawyerId}: Already has verificationStatus = ${data.verificationStatus}`);
        alreadySetCount++;
        continue;
      }
      
      // Set verificationStatus based on verified field
      const verificationStatus = data.verified ? 'approved' : 'pending';
      
      await doc.ref.update({
        verificationStatus,
        updatedAt: new Date(),
      });
      
      console.log(`✅ ${data.name || lawyerId}: Updated verificationStatus to '${verificationStatus}' (verified: ${data.verified})`);
      updatedCount++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   Total profiles: ${snapshot.size}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Already set: ${alreadySetCount}`);
    console.log('\n✅ Migration completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error fixing lawyer verification status:', error);
    process.exit(1);
  }
}

// Run the migration
fixLawyerVerificationStatus()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
