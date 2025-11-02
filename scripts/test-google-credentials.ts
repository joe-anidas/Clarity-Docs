/**
 * Test script to validate Google Cloud credentials for Google Meet integration
 * 
 * Run this script to check if your .env.local is configured correctly:
 * npx tsx scripts/test-google-credentials.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 Testing Google Cloud Credentials...\n');

// Check if credentials exist
const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;

if (!clientEmail || !privateKey) {
  console.error('❌ Missing credentials in .env.local');
  console.error('\nPlease set:');
  console.error('  - GOOGLE_CLOUD_CLIENT_EMAIL');
  console.error('  - GOOGLE_CLOUD_PRIVATE_KEY');
  console.error('\nSee GOOGLE_MEET_SETUP.md for instructions.\n');
  process.exit(1);
}

console.log('✅ Credentials found in .env.local\n');

// Validate client email format
console.log('📧 Client Email:', clientEmail);
if (!clientEmail.includes('@') || !clientEmail.includes('.iam.gserviceaccount.com')) {
  console.warn('⚠️  Email format looks unusual. Should be: xxx@project.iam.gserviceaccount.com\n');
} else {
  console.log('✅ Client email format looks correct\n');
}

// Validate private key format
console.log('🔑 Private Key validation:');

// Check if it starts correctly
if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
  console.error('❌ Private key must start with: -----BEGIN PRIVATE KEY-----');
  console.error('   Current start:', privateKey.substring(0, 50));
  process.exit(1);
}

if (!privateKey.includes('-----END PRIVATE KEY-----')) {
  console.error('❌ Private key must end with: -----END PRIVATE KEY-----');
  process.exit(1);
}

console.log('✅ Private key has correct BEGIN/END markers');

// Check for newline characters
if (!privateKey.includes('\\n')) {
  console.warn('⚠️  Private key might be missing \\n characters');
  console.warn('   Make sure to copy the key exactly from the JSON file');
} else {
  console.log('✅ Private key contains \\n characters');
}

// Try to format the key
const formattedKey = privateKey.replace(/\\n/g, '\n');
const lines = formattedKey.split('\n');

console.log(`✅ Private key has ${lines.length} lines`);

if (lines.length < 3) {
  console.error('❌ Private key seems too short. Should have multiple lines.');
  console.error('   Make sure you copied the entire key including all \\n characters');
  process.exit(1);
}

// Try to test with Google APIs
console.log('\n📡 Testing connection to Google APIs...');

import('googleapis').then(async ({ google }) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedKey,
      },
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const client = await auth.getClient();
    console.log('✅ Successfully authenticated with Google!');
    
    // Try to get calendar list
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.calendarList.list();
    
    console.log('✅ Successfully connected to Google Calendar API');
    console.log(`✅ Found ${res.data.items?.length || 0} calendars\n`);
    
    console.log('🎉 All tests passed! Your credentials are configured correctly.');
    console.log('   You can now create Google Meet links from the chat interface.\n');
    
  } catch (error: any) {
    console.error('\n❌ Failed to authenticate with Google');
    console.error('Error:', error.message);
    
    if (error.message.includes('DECODER routines::unsupported')) {
      console.error('\n💡 This error means the private key format is incorrect.');
      console.error('   Common issues:');
      console.error('   1. Missing or wrong \\n characters');
      console.error('   2. Extra quotes or spaces in the key');
      console.error('   3. Key was modified or truncated when copying');
      console.error('\n   Solution:');
      console.error('   - Open the JSON file you downloaded from Google Cloud');
      console.error('   - Copy the ENTIRE "private_key" value (including quotes)');
      console.error('   - Paste it directly into .env.local after GOOGLE_CLOUD_PRIVATE_KEY=');
    } else if (error.message.includes('invalid_grant')) {
      console.error('\n💡 The credentials are valid but not authorized.');
      console.error('   Make sure you:');
      console.error('   1. Enabled Google Calendar API in Cloud Console');
      console.error('   2. Added the service account email to your Google Calendar');
    }
    
    console.error('\nSee GOOGLE_MEET_SETUP.md for detailed setup instructions.\n');
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Failed to load googleapis package');
  console.error('   Run: npm install googleapis');
  process.exit(1);
});
