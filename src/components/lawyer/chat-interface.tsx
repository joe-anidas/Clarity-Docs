"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, ChatSession } from "@/types/consultation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  closeChatSession,
} from "@/lib/chat-actions";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChatInterfaceProps {
  session: ChatSession;
  currentUserId: string;
  currentUserRole: "user" | "lawyer";
  onClose?: () => void;
}

export function ChatInterface({
  session,
  currentUserId,
  currentUserRole,
  onClose,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentUserName =
    currentUserRole === "user"
      ? session.participants.userName
      : session.participants.lawyerName;

  // Load initial messages and set up real-time listener
  useEffect(() => {
    const messagesRef = collection(db, "chatSessions", session.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
    });

    return () => unsubscribe();
  }, [session.id, currentUserId]);

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

  const otherParticipantName =
    currentUserRole === "user"
      ? session.participants.lawyerName
      : session.participants.userName;

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chat with {otherParticipantName}</CardTitle>
            <CardDescription>
              {session.status === "active"
                ? "Session is active"
                : "Session closed"}
            </CardDescription>
          </div>
          {session.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseSession}
              disabled={isClosing}
            >
              {isClosing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Close Session
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              const isSystem = message.messageType === "system";

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {message.message}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
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
                      "flex flex-col gap-1 max-w-[70%]",
                      isCurrentUser ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{message.senderName}</span>
                      <span>{format(message.createdAt, "p")}</span>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2",
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Message Input */}
        {session.status === "active" && (
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex gap-2">
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
                className="resize-none"
                rows={3}
                disabled={isSending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim() || isSending}
                className="h-auto"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
