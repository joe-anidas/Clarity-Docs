import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
  addDoc,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "./firebase";
import { LawyerProfile, LawyerReview, LawyerStats } from "@/types/lawyer";
import { ConsultationFilters } from "@/types/consultation";

// Create a lawyer profile
export async function createLawyerProfile(
  userId: string,
  profileData: Omit<LawyerProfile, "id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; error?: string; profileId?: string }> {
  try {
    const profileRef = doc(db, "lawyerProfiles", userId);
    
    const profileWithTimestamps = {
      ...profileData,
      userId,
      verified: false, // Default to false until admin verifies
      verificationStatus: 'pending' as const, // Default to pending until admin reviews
      rating: 0,
      reviewCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(profileRef, profileWithTimestamps);

    // Update user document to set role as lawyer
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: "lawyer",
      lawyerProfileId: userId,
    });

    return { success: true, profileId: userId };
  } catch (error) {
    console.error("Error creating lawyer profile:", error);
    return { success: false, error: "Failed to create lawyer profile" };
  }
}

// Get a lawyer profile by ID
export async function getLawyerProfile(
  lawyerId: string
): Promise<LawyerProfile | null> {
  try {
    const profileRef = doc(db, "lawyerProfiles", lawyerId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return null;
    }

    const data = profileSnap.data();
    return {
      id: profileSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as LawyerProfile;
  } catch (error) {
    console.error("Error getting lawyer profile:", error);
    return null;
  }
}

// Get all verified lawyers with optional filters
export async function getVerifiedLawyers(
  filters?: ConsultationFilters
): Promise<LawyerProfile[]> {
  try {
    let q = query(
      collection(db, "lawyerProfiles"),
      where("verificationStatus", "==", "approved")
    );

    if (filters?.specialization) {
      q = query(q, where("specializations", "array-contains", filters.specialization));
    }

    if (filters?.minRating) {
      q = query(q, where("rating", ">=", filters.minRating));
    }

    if (filters?.language) {
      q = query(q, where("languages", "array-contains", filters.language));
    }

    // Limit without orderBy to avoid index issues
    q = query(q, limit(50));

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} verified lawyers`);
    
    let lawyers = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        verificationCompletedAt: data.verificationCompletedAt?.toDate ? data.verificationCompletedAt.toDate() : data.verificationCompletedAt,
        verificationRequestedAt: data.verificationRequestedAt?.toDate ? data.verificationRequestedAt.toDate() : data.verificationRequestedAt,
      } as LawyerProfile;
    });

    // Client-side filtering for fields that can't be queried directly
    if (filters?.maxHourlyRate) {
      lawyers = lawyers.filter((l: LawyerProfile) => l.hourlyRate <= filters.maxHourlyRate!);
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      lawyers = lawyers.filter(
        (l: LawyerProfile) =>
          l.name.toLowerCase().includes(query) ||
          l.bio.toLowerCase().includes(query) ||
          l.specializations.some((s: string) => s.toLowerCase().includes(query))
      );
    }

    // Sort by rating on the client side
    lawyers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    console.log(`Returning ${lawyers.length} verified lawyers after filtering`);
    return lawyers;
  } catch (error) {
    console.error("Error getting verified lawyers:", error);
    return [];
  }
}

// Update lawyer profile
export async function updateLawyerProfile(
  lawyerId: string,
  updates: Partial<LawyerProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const profileRef = doc(db, "lawyerProfiles", lawyerId);
    
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating lawyer profile:", error);
    return { success: false, error: "Failed to update lawyer profile" };
  }
}

// Verify a lawyer (admin only)
export async function verifyLawyer(
  lawyerId: string,
  verified: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const profileRef = doc(db, "lawyerProfiles", lawyerId);
    
    await updateDoc(profileRef, {
      verified,
      verificationStatus: verified ? 'approved' : 'rejected',
      verificationCompletedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error verifying lawyer:", error);
    return { success: false, error: "Failed to verify lawyer" };
  }
}

// Add a review for a lawyer
export async function addLawyerReview(
  lawyerId: string,
  userId: string,
  userName: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Add review document
    const reviewRef = collection(db, "lawyerReviews");
    await addDoc(reviewRef, {
      lawyerId,
      userId,
      userName,
      rating,
      comment,
      createdAt: Timestamp.now(),
    });

    // Update lawyer's average rating
    const reviewsQuery = query(
      collection(db, "lawyerReviews"),
      where("lawyerId", "==", lawyerId)
    );
    const reviewsSnap = await getDocs(reviewsQuery);
    
    const reviews = reviewsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data());
    const averageRating =
      reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

    const profileRef = doc(db, "lawyerProfiles", lawyerId);
    await updateDoc(profileRef, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviews.length,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding lawyer review:", error);
    return { success: false, error: "Failed to add review" };
  }
}

// Get reviews for a lawyer
export async function getLawyerReviews(
  lawyerId: string
): Promise<LawyerReview[]> {
  try {
    const reviewsQuery = query(
      collection(db, "lawyerReviews"),
      where("lawyerId", "==", lawyerId),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(reviewsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as LawyerReview;
    });
  } catch (error) {
    console.error("Error getting lawyer reviews:", error);
    return [];
  }
}

// Get lawyer statistics
export async function getLawyerStats(lawyerId: string): Promise<LawyerStats | null> {
  try {
    const profile = await getLawyerProfile(lawyerId);
    if (!profile) return null;

    // Get consultation counts
    const consultationsQuery = query(
      collection(db, "consultationRequests"),
      where("lawyerId", "==", lawyerId)
    );
    const consultationsSnap = await getDocs(consultationsQuery);
    
    const consultations = consultationsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.data());
    const completedConsultations = consultations.filter(
      (c: any) => c.status === "completed"
    );

    return {
      totalConsultations: consultations.length,
      completedConsultations: completedConsultations.length,
      averageResponseTime: 15, // TODO: Calculate actual response time
      rating: profile.rating,
      reviewCount: profile.reviewCount,
    };
  } catch (error) {
    console.error("Error getting lawyer stats:", error);
    return null;
  }
}

// Delete lawyer profile
export async function deleteLawyerProfile(
  lawyerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const profileRef = doc(db, "lawyerProfiles", lawyerId);
    await deleteDoc(profileRef);

    // Update user role back to regular user
    const userRef = doc(db, "users", lawyerId);
    await updateDoc(userRef, {
      role: "user",
      lawyerProfileId: null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting lawyer profile:", error);
    return { success: false, error: "Failed to delete lawyer profile" };
  }
}
