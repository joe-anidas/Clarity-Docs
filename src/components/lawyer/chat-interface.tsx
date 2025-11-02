"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, ChatSession } from "@/types/consultation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, Loader2, X, Video, Paperclip, FileText, Download, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  closeChatSession,
} from "@/lib/chat-actions";
import { uploadChatDocument } from "@/lib/storage-actions";
import { createGoogleMeet } from "@/lib/google-meet-actions";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

interface ChatInterfaceProps {
  session: ChatSession;
  currentUserId: string;
  currentUserRole: "user" | "lawyer";
  currentUserEmail?: string; // Add email prop
  onClose?: () => void;
}

export function ChatInterface({
  session,
  currentUserId,
  currentUserRole,
  currentUserEmail,
  onClose,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState(false);
  const [showMeetDialog, setShowMeetDialog] = useState(false);
  const [meetDateTime, setMeetDateTime] = useState("");
  const [meetDuration, setMeetDuration] = useState("30"); // duration in minutes
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentUserName =
    currentUserRole === "user"
      ? session.participants.userName
      : session.participants.lawyerName;

  // Helper function to render text with clickable links
  const renderMessageWithLinks = (text: string, isCurrentUser: boolean) => {
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlPattern);
    
    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "underline font-medium hover:opacity-80 transition-opacity break-all",
              isCurrentUser ? "text-primary-foreground" : "text-primary"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Load initial messages and set up real-time listener
  useEffect(() => {
    console.log("Setting up chat listener for session:", session.id);
    console.log("Current user:", currentUserId);
    console.log("Session participants:", session.participants);
    
    const messagesRef = collection(db, "chatSessions", session.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        console.log("Messages snapshot received:", snapshot.docs.length, "messages");
        const loadedMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          } as ChatMessage;
        });
        setMessages(loadedMessages);

        // Mark messages as read
        markMessagesAsRead(session.id, currentUserId);
      },
      (error) => {
        console.error("Error loading messages:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        toast({
          title: "Error Loading Messages",
          description: `${error.message || "Unable to load chat messages"}. Please refresh the page.`,
          variant: "destructive",
        });
      }
    );

    return () => unsubscribe();
  }, [session.id, currentUserId, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const result = await sendChatMessage(
        session.id,
        currentUserId,
        currentUserName,
        currentUserRole,
        newMessage.trim()
      );

      if (result.success) {
        setNewMessage("");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseSession = async () => {
    setIsClosing(true);
    setShowCloseConfirmDialog(false);

    try {
      const result = await closeChatSession(session.id);

      if (result.success) {
        toast({
          title: "Session Closed",
          description: "The chat session has been closed successfully.",
        });
        onClose?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleCreateAndSendMeet = async () => {
    // Validate date/time
    if (!meetDateTime) {
      toast({
        title: "Error",
        description: "Please select a meeting date and time",
        variant: "destructive",
      });
      return;
    }

    const meetDate = new Date(meetDateTime);
    if (meetDate < new Date()) {
      toast({
        title: "Error",
        description: "Meeting time cannot be in the past",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingMeet(true);
    try {
      // Get participant emails from session or use current user's email from auth (optional)
      const otherParticipantEmail = currentUserRole === "lawyer" 
        ? session.participants.userEmail
        : session.participants.lawyerEmail;
      
      const currentUserEmailAddress = currentUserEmail || 
        (currentUserRole === "lawyer" 
          ? session.participants.lawyerEmail
          : session.participants.userEmail
        );

      console.log("Creating Google Meet...");
      console.log("Participant emails:", { currentUserEmailAddress, otherParticipantEmail });

      // Create Google Meet using Calendar API
      const meetingResult = await createGoogleMeet({
        summary: `Legal Consultation: ${session.participants.userName} & ${session.participants.lawyerName}`,
        attendeeEmail: otherParticipantEmail || "",
        lawyerEmail: currentUserEmailAddress || "",
        startTime: meetDate.toISOString(),
        duration: parseInt(meetDuration),
        description: `ClarityDocs legal consultation session.`,
      });

      if (!meetingResult.success || !meetingResult.meetLink) {
        throw new Error(meetingResult.error || "Failed to create Google Meet");
      }

      // Send the meet link in chat
      const meetMessage = `📹 Video Meeting Scheduled\n\n🔗 Google Meet Link: ${meetingResult.meetLink}\n📅 Scheduled Time: ${format(meetDate, "PPpp")}\n⏱️ Duration: ${meetDuration} minutes\n\nClick the link above to join the meeting at the scheduled time.`;

      const result = await sendChatMessage(
        session.id,
        currentUserId,
        currentUserName,
        currentUserRole,
        meetMessage,
        "text"
      );

      if (result.success) {
        toast({
          title: "Meeting Created Successfully!",
          description: "Google Meet link has been created and calendar invitations have been sent.",
        });
        setShowMeetDialog(false);
        setMeetDateTime("");
        setMeetDuration("30");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error Creating Meeting",
        description: error instanceof Error ? error.message : "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingMeet(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setShowDocumentDialog(true);
    }
  };

  const handleSendDocument = async () => {
    if (!selectedFile) return;

    console.log("Starting document upload:", selectedFile.name, selectedFile.type, selectedFile.size);
    setIsUploadingDoc(true);
    setUploadProgress(0);
    try {
      // Upload file to Firebase Storage with progress tracking
      const uploadResult = await uploadChatDocument(
        selectedFile,
        session.id,
        currentUserId,
        (progress) => {
          console.log("Progress update received:", progress);
          setUploadProgress(progress);
        }
      );

      console.log("Upload result:", uploadResult);

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Failed to upload document");
      }

      // Send message with document URL
      const docMessage = `📎 Document Shared: ${selectedFile.name}\n\nSize: ${(selectedFile.size / 1024).toFixed(2)} KB`;

      const result = await sendChatMessage(
        session.id,
        currentUserId,
        currentUserName,
        currentUserRole,
        docMessage,
        "document",
        uploadResult.url, // The actual uploaded file URL
        selectedFile.name
      );

      if (result.success) {
        toast({
          title: "Document Sent",
          description: "The document has been shared in the chat.",
        });
        setShowDocumentDialog(false);
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error sending document:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const otherParticipantName =
    currentUserRole === "user"
      ? session.participants.lawyerName
      : session.participants.userName;

  return (
    <>
      <Card className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] min-h-[500px] shadow-lg">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                  {otherParticipantName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{otherParticipantName}</CardTitle>
                <CardDescription className="text-xs">
                  {session.status === "active" ? (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Active Session
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                      Session Closed
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {session.status === "active" && (
                <>
                  {/* Schedule Meet button - only for lawyers */}
                  {currentUserRole === "lawyer" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Set default time to current time rounded to next 15 minutes
                          const now = new Date();
                          const minutes = now.getMinutes();
                          const roundedMinutes = Math.ceil(minutes / 15) * 15;
                          now.setMinutes(roundedMinutes);
                          now.setSeconds(0);
                          now.setMilliseconds(0);
                          
                          // Format for datetime-local input: YYYY-MM-DDTHH:mm
                          // Use local time, not UTC
                          const year = now.getFullYear();
                          const month = String(now.getMonth() + 1).padStart(2, '0');
                          const day = String(now.getDate()).padStart(2, '0');
                          const hours = String(now.getHours()).padStart(2, '0');
                          const mins = String(now.getMinutes()).padStart(2, '0');
                          const defaultDateTime = `${year}-${month}-${day}T${hours}:${mins}`;
                          
                          setMeetDateTime(defaultDateTime);
                          setShowMeetDialog(true);
                        }}
                        className="hidden sm:flex"
                      >
                        <Video className="sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Schedule Meet</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Set default time to current time rounded to next 15 minutes
                          const now = new Date();
                          const minutes = now.getMinutes();
                          const roundedMinutes = Math.ceil(minutes / 15) * 15;
                          now.setMinutes(roundedMinutes);
                          now.setSeconds(0);
                          now.setMilliseconds(0);
                          
                          // Format for datetime-local input: YYYY-MM-DDTHH:mm
                          // Use local time, not UTC
                          const year = now.getFullYear();
                          const month = String(now.getMonth() + 1).padStart(2, '0');
                          const day = String(now.getDate()).padStart(2, '0');
                          const hours = String(now.getHours()).padStart(2, '0');
                          const mins = String(now.getMinutes()).padStart(2, '0');
                          const defaultDateTime = `${year}-${month}-${day}T${hours}:${mins}`;
                          
                          setMeetDateTime(defaultDateTime);
                          setShowMeetDialog(true);
                        }}
                        className="sm:hidden"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {/* Close Session button - for both users and lawyers */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCloseConfirmDialog(true)}
                    disabled={isClosing}
                    className="hidden sm:flex"
                  >
                    {isClosing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Close Session</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCloseConfirmDialog(true)}
                    disabled={isClosing}
                    className="sm:hidden"
                  >
                    {isClosing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4 sm:px-6 py-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Start the conversation below</p>
              </div>
            )}
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              const isSystem = message.messageType === "system";

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center my-6">
                    <div className="text-xs text-muted-foreground bg-muted px-4 py-1.5 rounded-full border border-border/50 shadow-sm">
                      {message.message}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 group",
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="h-9 w-9 mt-1 flex-shrink-0 border-2 border-border/50">
                    <AvatarFallback className={cn(
                      "text-xs font-medium",
                      isCurrentUser ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    )}>
                      {message.senderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "flex flex-col gap-1.5 max-w-[80%] sm:max-w-[70%]",
                      isCurrentUser ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "flex items-center gap-2 text-xs",
                      isCurrentUser ? "flex-row-reverse" : "flex-row"
                    )}>
                      <span className="font-medium text-foreground">{message.senderName}</span>
                      <span className="text-muted-foreground/70">{format(message.createdAt, "p")}</span>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 shadow-sm transition-all group-hover:shadow-md",
                        isCurrentUser
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted border border-border/50 rounded-tl-sm"
                      )}
                    >
                      {message.messageType === "document" ? (
                        <div className="space-y-2.5">
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {renderMessageWithLinks(message.message, isCurrentUser)}
                          </div>
                          {message.attachmentName && (
                            <div className={cn(
                              "flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors",
                              isCurrentUser 
                                ? "bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/15" 
                                : "bg-background border-border hover:bg-muted"
                            )}>
                              <FileText className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm flex-1 truncate font-medium">
                                {message.attachmentName}
                              </span>
                              {message.attachmentUrl ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 flex-shrink-0 hover:bg-background/50"
                                  onClick={() => window.open(message.attachmentUrl, '_blank')}
                                  title="Download document"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground px-2">
                                  Demo
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {renderMessageWithLinks(message.message, isCurrentUser)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Message Input */}
        {session.status === "active" ? (
          <form onSubmit={handleSendMessage} className="border-t bg-muted/20 p-4 sm:p-6">
            <div className="flex gap-2 items-end">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Document"
                className="flex-shrink-0 h-10 w-10"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  className="resize-none min-h-[2.5rem] max-h-[8rem] pr-12"
                  rows={1}
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || isSending}
                  className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 pl-12">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] border">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] border">Shift+Enter</kbd> for new line
            </p>
          </form>
        ) : (
          <div className="border-t bg-muted/20 p-6 text-center">
            <p className="text-sm text-muted-foreground">This chat session has been closed</p>
          </div>
        )}
      </CardContent>
      </Card>

      {/* Google Meet Dialog */}
      <Dialog open={showMeetDialog} onOpenChange={setShowMeetDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Schedule Google Meet
            </DialogTitle>
            <DialogDescription>
              Create a Google Meet link for your consultation with {otherParticipantName}. The meeting link will be shared in the chat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="meet-datetime" className="text-sm font-medium">
                Meeting Date & Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="meet-datetime"
                type="datetime-local"
                value={meetDateTime}
                onChange={(e) => setMeetDateTime(e.target.value)}
                className="h-10"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">
                Select when you want to meet with {otherParticipantName}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meet-duration" className="text-sm font-medium">
                Duration (minutes) <span className="text-destructive">*</span>
              </Label>
              <select
                id="meet-duration"
                value={meetDuration}
                onChange={(e) => setMeetDuration(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-900">
              <div className="flex gap-2">
                <Video className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">Meeting Link</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    A Google Meet link will be generated and shared in the chat. Both participants can join using this link.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMeetDialog(false)}
              disabled={isCreatingMeet}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAndSendMeet} disabled={isCreatingMeet || !meetDateTime}>
              {isCreatingMeet && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreatingMeet ? "Creating Meeting..." : "Create & Send Meet Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-primary" />
              Send Document
            </DialogTitle>
            <DialogDescription>
              Share a document with {otherParticipantName}
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4 py-4">
              {isUploadingDoc ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CircularProgress 
                    value={uploadProgress} 
                    size={120} 
                    strokeWidth={8}
                    showPercentage={true}
                  />
                  <p className="mt-4 text-sm font-medium text-center">
                    Uploading {selectedFile.name}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please wait while we upload your document
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDocumentDialog(false);
                setSelectedFile(null);
                setUploadProgress(0);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={isUploadingDoc}
            >
              Cancel
            </Button>
            <Button onClick={handleSendDocument} disabled={isUploadingDoc}>
              {isUploadingDoc && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Session Confirmation Dialog */}
      <AlertDialog open={showCloseConfirmDialog} onOpenChange={setShowCloseConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Chat Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this chat session with {otherParticipantName}? 
              This action cannot be undone. The conversation history will be preserved, 
              but no new messages can be sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCloseSession}
              disabled={isClosing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isClosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                "Yes, Close Session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
