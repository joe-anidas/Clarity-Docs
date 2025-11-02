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
  addDoc,
  onSnapshot,
  deleteDoc,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "./firebase";
import {
  ConsultationRequest,
  ConsultationStatus,
  ChatSession,
  ChatMessage,
} from "@/types/consultation";

// Create a consultation request
export async function createConsultationRequest(
  userId: string,
  userName: string,
  userEmail: string,
  lawyerId: string,
  lawyerName: string,
  message: string,
  urgency: "low" | "medium" | "high",
  documentId?: string,
  documentName?: string,
  preferredDateTime?: Date
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    const requestRef = collection(db, "consultationRequests");
    
    const requestData = {
      userId,
      userName,
      userEmail,
      lawyerId,
      lawyerName,
      documentId,
      documentName,
      status: "pending" as ConsultationStatus,
      message,
      urgency,
      preferredDateTime: preferredDateTime ? Timestamp.fromDate(preferredDateTime) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(requestRef, requestData);

    return { success: true, requestId: docRef.id };
  } catch (error) {
    console.error("Error creating consultation request:", error);
    return { success: false, error: "Failed to create consultation request" };
  }
}

// Get consultation request by ID
export async function getConsultationRequest(
  requestId: string
): Promise<ConsultationRequest | null> {
  try {
    const requestRef = doc(db, "consultationRequests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      return null;
    }

    const data = requestSnap.data();
    return {
      id: requestSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      acceptedAt: data.acceptedAt?.toDate(),
      completedAt: data.completedAt?.toDate(),
      preferredDateTime: data.preferredDateTime?.toDate(),
    } as ConsultationRequest;
  } catch (error) {
    console.error("Error getting consultation request:", error);
    return null;
  }
}

// Get consultation requests for a user
export async function getUserConsultationRequests(
  userId: string
): Promise<ConsultationRequest[]> {
  try {
    const requestsQuery = query(
      collection(db, "consultationRequests"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(requestsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        acceptedAt: data.acceptedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        preferredDateTime: data.preferredDateTime?.toDate(),
      } as ConsultationRequest;
    });
  } catch (error) {
    console.error("Error getting user consultation requests:", error);
    return [];
  }
}

// Get consultation requests for a lawyer
export async function getLawyerConsultationRequests(
  lawyerId: string,
  status?: ConsultationStatus
): Promise<ConsultationRequest[]> {
  try {
    let requestsQuery = query(
      collection(db, "consultationRequests"),
      where("lawyerId", "==", lawyerId)
    );

    if (status) {
      requestsQuery = query(requestsQuery, where("status", "==", status));
    }

    requestsQuery = query(requestsQuery, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(requestsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        acceptedAt: data.acceptedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        preferredDateTime: data.preferredDateTime?.toDate(),
      } as ConsultationRequest;
    });
  } catch (error) {
    console.error("Error getting lawyer consultation requests:", error);
    return [];
  }
}

// Update consultation request status
export async function updateConsultationStatus(
  requestId: string,
  status: ConsultationStatus,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const requestRef = doc(db, "consultationRequests", requestId);
    
    const updates: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (status === "accepted") {
      updates.acceptedAt = Timestamp.now();
    } else if (status === "completed") {
      updates.completedAt = Timestamp.now();
    } else if (status === "rejected" && rejectionReason) {
      updates.rejectionReason = rejectionReason;
    }

    await updateDoc(requestRef, updates);

    // If accepted, create a chat session
    if (status === "accepted") {
      const request = await getConsultationRequest(requestId);
      if (request) {
        await createChatSession(
          requestId,
          request.userId,
          request.userName,
          request.lawyerId,
          request.lawyerName
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating consultation status:", error);
    return { success: false, error: "Failed to update consultation status" };
  }
}

// Create a chat session
export async function createChatSession(
  consultationRequestId: string,
  userId: string,
  userName: string,
  lawyerId: string,
  lawyerName: string
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  try {
    const sessionRef = collection(db, "chatSessions");
    
    const sessionData = {
      consultationRequestId,
      participants: {
        userId,
        userName,
        lawyerId,
        lawyerName,
      },
      status: "active",
      startedAt: Timestamp.now(),
      lastMessageAt: Timestamp.now(),
    };

    const docRef = await addDoc(sessionRef, sessionData);

    // Send initial system message
    await sendChatMessage(
      docRef.id,
      "system",
      "System",
      "system",
      `Chat session started between ${userName} and ${lawyerName}`,
      "system"
    );

    return { success: true, sessionId: docRef.id };
  } catch (error) {
    console.error("Error creating chat session:", error);
    return { success: false, error: "Failed to create chat session" };
  }
}

// Get chat session by consultation request ID
export async function getChatSessionByRequestId(
  requestId: string
): Promise<ChatSession | null> {
  try {
    const sessionsQuery = query(
      collection(db, "chatSessions"),
      where("consultationRequestId", "==", requestId),
      limit(1)
    );

    const querySnapshot = await getDocs(sessionsQuery);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      startedAt: data.startedAt?.toDate(),
      endedAt: data.endedAt?.toDate(),
      lastMessageAt: data.lastMessageAt?.toDate(),
    } as ChatSession;
  } catch (error) {
    console.error("Error getting chat session:", error);
    return null;
  }
}

// Get chat session by ID
export async function getChatSession(
  sessionId: string
): Promise<ChatSession | null> {
  try {
    const sessionRef = doc(db, "chatSessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return null;
    }

    const data = sessionSnap.data();
    return {
      id: sessionSnap.id,
      ...data,
      startedAt: data.startedAt?.toDate(),
      endedAt: data.endedAt?.toDate(),
      lastMessageAt: data.lastMessageAt?.toDate(),
    } as ChatSession;
  } catch (error) {
    console.error("Error getting chat session:", error);
    return null;
  }
}

// Send a chat message
export async function sendChatMessage(
  sessionId: string,
  senderId: string,
  senderName: string,
  senderRole: "user" | "lawyer" | "system",
  message: string,
  messageType: "text" | "document" | "system" = "text",
  attachmentUrl?: string,
  attachmentName?: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const messagesRef = collection(db, "chatSessions", sessionId, "messages");
    
    const messageData = {
      sessionId,
      senderId,
      senderName,
      senderRole,
      message,
      messageType,
      attachmentUrl,
      attachmentName,
      createdAt: Timestamp.now(),
      read: false,
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update session's lastMessageAt
    const sessionRef = doc(db, "chatSessions", sessionId);
    await updateDoc(sessionRef, {
      lastMessageAt: Timestamp.now(),
    });

    return { success: true, messageId: docRef.id };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

// Get chat messages for a session
export async function getChatMessages(
  sessionId: string,
  limitCount: number = 100
): Promise<ChatMessage[]> {
  try {
    const messagesQuery = query(
      collection(db, "chatSessions", sessionId, "messages"),
      orderBy("createdAt", "asc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(messagesQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as ChatMessage;
    });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    return [];
  }
}

// Mark messages as read
export async function markMessagesAsRead(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const messagesQuery = query(
      collection(db, "chatSessions", sessionId, "messages"),
      where("senderId", "!=", userId),
      where("read", "==", false)
    );

    const querySnapshot = await getDocs(messagesQuery);
    
    const updatePromises = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);

    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: "Failed to mark messages as read" };
  }
}

// Close chat session
export async function closeChatSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionRef = doc(db, "chatSessions", sessionId);
    
    await updateDoc(sessionRef, {
      status: "closed",
      endedAt: Timestamp.now(),
    });

    // Send system message
    await sendChatMessage(
      sessionId,
      "system",
      "System",
      "system",
      "Chat session has been closed",
      "system"
    );

    return { success: true };
  } catch (error) {
    console.error("Error closing chat session:", error);
    return { success: false, error: "Failed to close chat session" };
  }
}

// Get active chat sessions for a user
export async function getUserActiveChatSessions(
  userId: string
): Promise<ChatSession[]> {
  try {
    const sessionsQuery = query(
      collection(db, "chatSessions"),
      where("participants.userId", "==", userId),
      where("status", "==", "active"),
      orderBy("lastMessageAt", "desc")
    );

    const querySnapshot = await getDocs(sessionsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate(),
        endedAt: data.endedAt?.toDate(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as ChatSession;
    });
  } catch (error) {
    console.error("Error getting user active chat sessions:", error);
    return [];
  }
}

// Get active chat sessions for a lawyer
export async function getLawyerActiveChatSessions(
  lawyerId: string
): Promise<ChatSession[]> {
  try {
    const sessionsQuery = query(
      collection(db, "chatSessions"),
      where("participants.lawyerId", "==", lawyerId),
      where("status", "==", "active"),
      orderBy("lastMessageAt", "desc")
    );

    const querySnapshot = await getDocs(sessionsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate(),
        endedAt: data.endedAt?.toDate(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as ChatSession;
    });
  } catch (error) {
    console.error("Error getting lawyer active chat sessions:", error);
    return [];
  }
}
