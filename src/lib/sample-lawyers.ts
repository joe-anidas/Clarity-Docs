/**
 * Sample Lawyer Data for Testing
 * 
 * To add these lawyers to your Firestore:
 * 1. Go to Firebase Console > Firestore Database
 * 2. Create a collection called 'lawyerProfiles'
 * 3. Add documents with the data below
 * 4. Update the userId fields to match real user IDs in your system
 * 5. Create corresponding user documents with role: "lawyer"
 */

export const sampleLawyers = [
  {
    userId: "REPLACE_WITH_USER_ID_1",
    email: "sarah.johnson@lawfirm.com",
    name: "Sarah Johnson",
    verified: true,
    specializations: ["Contract Law", "Corporate Law", "Commercial Law"],
    hourlyRate: 250,
    currency: "$",
    availability: {
      monday: [{ start: "09:00", end: "17:00" }],
      tuesday: [{ start: "09:00", end: "17:00" }],
      wednesday: [{ start: "09:00", end: "17:00" }],
      thursday: [{ start: "09:00", end: "17:00" }],
      friday: [{ start: "09:00", end: "15:00" }],
      saturday: [],
      sunday: [],
    },
    rating: 4.8,
    reviewCount: 45,
    licenseNumber: "BAR-2015-12345",
    barAssociation: "New York State Bar Association",
    yearsOfExperience: 12,
    bio: "Experienced corporate lawyer specializing in contract negotiations and business agreements. I help clients navigate complex legal documents and ensure their interests are protected.",
    languages: ["English", "Spanish"],
    location: "New York, NY",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "REPLACE_WITH_USER_ID_2",
    email: "michael.chen@legalpartners.com",
    name: "Michael Chen",
    verified: true,
    specializations: ["Employment Law", "Contract Law", "Litigation"],
    hourlyRate: 300,
    currency: "$",
    availability: {
      monday: [{ start: "10:00", end: "18:00" }],
      tuesday: [{ start: "10:00", end: "18:00" }],
      wednesday: [{ start: "10:00", end: "18:00" }],
      thursday: [{ start: "10:00", end: "18:00" }],
      friday: [{ start: "10:00", end: "16:00" }],
      saturday: [{ start: "10:00", end: "14:00" }],
      sunday: [],
    },
    rating: 4.9,
    reviewCount: 67,
    licenseNumber: "BAR-2012-67890",
    barAssociation: "California State Bar",
    yearsOfExperience: 15,
    bio: "Specializing in employment contracts and workplace legal issues. I provide clear, practical advice to both employers and employees.",
    languages: ["English", "Mandarin"],
    location: "San Francisco, CA",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "REPLACE_WITH_USER_ID_3",
    email: "priya.patel@techlaw.com",
    name: "Priya Patel",
    verified: true,
    specializations: ["Intellectual Property", "Contract Law", "Technology Law"],
    hourlyRate: 350,
    currency: "$",
    availability: {
      monday: [{ start: "08:00", end: "16:00" }],
      tuesday: [{ start: "08:00", end: "16:00" }],
      wednesday: [{ start: "08:00", end: "16:00" }],
      thursday: [{ start: "08:00", end: "16:00" }],
      friday: [{ start: "08:00", end: "12:00" }],
      saturday: [],
      sunday: [],
    },
    rating: 5.0,
    reviewCount: 89,
    licenseNumber: "BAR-2010-11111",
    barAssociation: "Massachusetts Bar Association",
    yearsOfExperience: 18,
    bio: "Expert in technology contracts, intellectual property, and software licensing agreements. I work with startups and established tech companies.",
    languages: ["English", "Hindi", "Gujarati"],
    location: "Boston, MA",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "REPLACE_WITH_USER_ID_4",
    email: "david.martinez@realestate.law",
    name: "David Martinez",
    verified: true,
    specializations: ["Real Estate Law", "Contract Law", "Commercial Law"],
    hourlyRate: 200,
    currency: "$",
    availability: {
      monday: [{ start: "09:00", end: "17:00" }],
      tuesday: [{ start: "09:00", end: "17:00" }],
      wednesday: [{ start: "09:00", end: "17:00" }],
      thursday: [{ start: "09:00", end: "17:00" }],
      friday: [{ start: "09:00", end: "17:00" }],
      saturday: [],
      sunday: [],
    },
    rating: 4.7,
    reviewCount: 32,
    licenseNumber: "BAR-2016-22222",
    barAssociation: "Texas State Bar",
    yearsOfExperience: 10,
    bio: "Focused on real estate transactions and commercial leases. I help clients understand complex property agreements and protect their investments.",
    languages: ["English", "Spanish"],
    location: "Austin, TX",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "REPLACE_WITH_USER_ID_5",
    email: "emily.wong@businesslaw.com",
    name: "Emily Wong",
    verified: true,
    specializations: ["Corporate Law", "Mergers & Acquisitions", "Contract Law"],
    hourlyRate: 400,
    currency: "$",
    availability: {
      monday: [{ start: "09:00", end: "18:00" }],
      tuesday: [{ start: "09:00", end: "18:00" }],
      wednesday: [{ start: "09:00", end: "18:00" }],
      thursday: [{ start: "09:00", end: "18:00" }],
      friday: [{ start: "09:00", end: "15:00" }],
      saturday: [],
      sunday: [],
    },
    rating: 4.9,
    reviewCount: 104,
    licenseNumber: "BAR-2008-33333",
    barAssociation: "Illinois State Bar Association",
    yearsOfExperience: 20,
    bio: "Senior corporate attorney with extensive M&A experience. I advise on complex business transactions and corporate governance matters.",
    languages: ["English", "Cantonese"],
    location: "Chicago, IL",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "REPLACE_WITH_USER_ID_6",
    email: "james.thompson@compliance.law",
    name: "James Thompson",
    verified: true,
    specializations: ["Compliance", "Contract Law", "Tax Law"],
    hourlyRate: 275,
    currency: "$",
    availability: {
      monday: [{ start: "10:00", end: "17:00" }],
      tuesday: [{ start: "10:00", end: "17:00" }],
      wednesday: [{ start: "10:00", end: "17:00" }],
      thursday: [{ start: "10:00", end: "17:00" }],
      friday: [{ start: "10:00", end: "14:00" }],
      saturday: [],
      sunday: [],
    },
    rating: 4.6,
    reviewCount: 28,
    licenseNumber: "BAR-2017-44444",
    barAssociation: "Washington State Bar Association",
    yearsOfExperience: 9,
    bio: "Specializing in regulatory compliance and tax law. I help businesses navigate complex regulations and ensure contract compliance.",
    languages: ["English"],
    location: "Seattle, WA",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Instructions to add lawyers to Firestore:
 * 
 * Option 1: Manual (Firebase Console)
 * 1. Go to Firebase Console > Firestore Database
 * 2. Click "Start collection"
 * 3. Collection ID: "lawyerProfiles"
 * 4. For each lawyer above:
 *    - Create a new document
 *    - Use auto-generated ID or custom ID
 *    - Copy the fields from the lawyer object
 *    - Replace REPLACE_WITH_USER_ID_X with actual user IDs
 * 
 * Option 2: Using Firebase Admin SDK (create a script)
 * See setup-lawyers-script.ts for automated setup
 * 
 * Option 3: Using the app
 * Create a one-time admin route that calls createLawyerProfile()
 * from src/lib/lawyer-actions.ts
 */
