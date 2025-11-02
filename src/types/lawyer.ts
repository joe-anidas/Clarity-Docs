export interface LawyerProfile {
  id: string;
  userId: string;
  email: string;
  name: string;
  verified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationDocuments?: string[]; // URLs to uploaded documents
  verificationRequestedAt?: Date;
  verificationCompletedAt?: Date;
  verificationNotes?: string; // Admin notes
  specializations: string[];
  hourlyRate: number;
  currency: string;
  availability: LawyerAvailability;
  rating: number;
  reviewCount: number;
  licenseNumber: string;
  barAssociation: string;
  yearsOfExperience: number;
  bio: string;
  profilePhoto?: string;
  languages: string[];
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LawyerAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface LawyerReview {
  id: string;
  lawyerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface LawyerStats {
  totalConsultations: number;
  completedConsultations: number;
  averageResponseTime: number; // in minutes
  rating: number;
  reviewCount: number;
}

export const SPECIALIZATIONS = [
  "Contract Law",
  "Corporate Law",
  "Employment Law",
  "Intellectual Property",
  "Real Estate Law",
  "Tax Law",
  "Commercial Law",
  "Litigation",
  "Mergers & Acquisitions",
  "Compliance",
  "Other"
] as const;

export type Specialization = typeof SPECIALIZATIONS[number];
