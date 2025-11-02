export interface ConsultationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lawyerId: string;
  lawyerName: string;
  documentId?: string;
  documentName?: string;
  status: ConsultationStatus;
  message: string;
  urgency: "low" | "medium" | "high";
  preferredDateTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  rejectionReason?: string;
}

export type ConsultationStatus = 
  | "pending" 
  | "accepted" 
  | "rejected" 
  | "in-progress" 
  | "completed" 
  | "cancelled";

export interface ChatSession {
  id: string;
  consultationRequestId: string;
  participants: {
    userId: string;
    userName: string;
    lawyerId: string;
    lawyerName: string;
  };
  status: "active" | "closed";
  startedAt: Date;
  endedAt?: Date;
  lastMessageAt?: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "lawyer";
  message: string;
  messageType: "text" | "document" | "system";
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: Date;
  read: boolean;
}

export interface ConsultationFilters {
  specialization?: string;
  minRating?: number;
  maxHourlyRate?: number;
  language?: string;
  availability?: string; // day of week
  searchQuery?: string;
}
