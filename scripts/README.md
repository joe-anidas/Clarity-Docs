# Clarity-Docs Admin Scripts

This directory contains utility scripts for managing Clarity-Docs.

## 🔐 User Role Management

### Upgrade User Role

Script to upgrade user roles (user → lawyer → admin) in Firestore.

#### Prerequisites

Make sure you have the following environment variables set in your `.env` file:
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `GOOGLE_CLOUD_CLIENT_EMAIL`
- `GOOGLE_CLOUD_PRIVATE_KEY`

#### Installation

```bash
# Install Firebase Admin SDK (if not already installed)
npm install firebase-admin

# Install tsx for running TypeScript (if not already installed)
npm install -D tsx
```

#### Usage

**Interactive Mode:**
```bash
npx tsx scripts/upgrade-user-role.ts
```

**Command Line Mode:**
```bash
npx tsx scripts/upgrade-user-role.ts <email> <role>
```

**Examples:**
```bash
# Upgrade to lawyer
npx tsx scripts/upgrade-user-role.ts john@example.com lawyer

# Upgrade to admin
npx tsx scripts/upgrade-user-role.ts admin@example.com admin

# Downgrade to regular user
npx tsx scripts/upgrade-user-role.ts user@example.com user
```

#### Valid Roles

- `user` - Regular user (default)
- `lawyer` - Lawyer with consultation features
- `admin` - Administrator with full access

#### After Upgrading to Lawyer

After upgrading a user to lawyer role, you need to create a lawyer profile:

1. Go to **Firebase Console** → **Firestore Database**
2. Create a new document in the `lawyerProfiles` collection
3. Use the user's UID as the document ID
4. Add the following fields:

```javascript
{
  userId: "user-uid-here",
  name: "John Doe",
  email: "john@example.com",
  verified: true,
  specializations: ["Contract Law", "Corporate Law"],
  hourlyRate: 250,
  currency: "USD",
  yearsOfExperience: 5,
  licenseNumber: "CA-123456",
  barAssociation: "California State Bar",
  bio: "Experienced contract lawyer...",
  languages: ["English"],
  location: "San Francisco, CA",
  rating: 4.5,
  reviewCount: 0,
  availability: {
    monday: [{ start: "09:00", end: "17:00" }],
    tuesday: [{ start: "09:00", end: "17:00" }]
  },
  createdAt: "2024-11-02T00:00:00.000Z",
  updatedAt: "2024-11-02T00:00:00.000Z"
}
```

Or use the sample lawyers in `src/lib/sample-lawyers.ts` as a template.

## 🧪 Testing

### Quick Test Flow

1. **Create three test accounts:**
   ```bash
   # Sign in with Google 3 times using different accounts
   ```

2. **Upgrade roles:**
   ```bash
   # Account 1: Keep as user (default)
   
   # Account 2: Upgrade to lawyer
   npx tsx scripts/upgrade-user-role.ts lawyer@example.com lawyer
   
   # Account 3: Upgrade to admin
   npx tsx scripts/upgrade-user-role.ts admin@example.com admin
   ```

3. **Create lawyer profile for Account 2** (see steps above)

4. **Test features:**
   - User: Upload documents, request consultations
   - Lawyer: Accept requests, chat with clients
   - Admin: Verify lawyers, access all data

## 📝 Notes

- Changes take effect immediately
- Users need to refresh or sign out/in to see role changes
- Firestore security rules enforce role-based access
- Always backup data before running scripts in production

## 🚨 Security

- Never commit your `.env` file
- Keep your service account credentials secure
- Only trusted admins should have access to these scripts
- Review Firestore security rules regularly
