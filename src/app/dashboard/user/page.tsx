"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConsultationRequest } from "@/types/consultation";
import {
  getUserConsultationRequests,
  getChatSessionByRequestId,
} from "@/lib/chat-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  FileText, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ConsultationStatus } from "@/types/consultation";

export default function UserDashboardPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await getUserConsultationRequests(user.uid);
      setRequests(data);
    } catch (error) {
      console.error("Error loading consultation requests:", error);
      toast({
        title: "Error",
        description: "Failed to load consultation requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = useCallback(async (request: ConsultationRequest) => {
    if (!user) return;
    
    try {
      const session = await getChatSessionByRequestId(request.id, user.uid);
      if (session) {
        router.push(`/chat/${session.id}`);
      } else {
        toast({
          title: "Chat Not Available",
          description: "The lawyer hasn't accepted your request yet",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open chat",
        variant: "destructive",
      });
    }
  }, [user, router, toast]);

  const getStatusBadge = (status: ConsultationStatus) => {
    const config = {
      pending: { 
        icon: Clock, 
        variant: "secondary" as const, 
        label: "Pending",
        description: "Waiting for lawyer response" 
      },
      accepted: { 
        icon: CheckCircle, 
        variant: "default" as const, 
        label: "Accepted",
        description: "Chat available" 
      },
      rejected: { 
        icon: XCircle, 
        variant: "destructive" as const, 
        label: "Rejected",
        description: "Request declined" 
      },
      "in-progress": { 
        icon: MessageSquare, 
        variant: "default" as const, 
        label: "In Progress",
        description: "Consultation ongoing" 
      },
      completed: { 
        icon: CheckCircle, 
        variant: "secondary" as const, 
        label: "Completed",
        description: "Consultation finished" 
      },
      cancelled: { 
        icon: XCircle, 
        variant: "secondary" as const, 
        label: "Cancelled",
        description: "Request cancelled" 
      },
    };

    const { icon: Icon, variant, label } = config[status] || config.pending;
    
    return (
      <Badge variant={variant}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      low: "secondary",
      medium: "default",
      high: "destructive",
    } as const;
    return (
      <Badge variant={variants[urgency as keyof typeof variants] || "default"}>
        {urgency} priority
      </Badge>
    );
  };

  const renderRequestCard = (request: ConsultationRequest) => {
    const canChat = request.status === "accepted" || request.status === "in-progress";

    return (
      <Card key={request.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                Consultation with {request.lawyerName}
              </CardTitle>
              <CardDescription>
                Requested {format(request.createdAt, "PPP")}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {getStatusBadge(request.status)}
              {getUrgencyBadge(request.urgency)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Your Message:</p>
            <p className="text-sm">{request.message}</p>
          </div>

          {request.documentName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Document: {request.documentName}</span>
            </div>
          )}

          {request.preferredDateTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Preferred: {format(request.preferredDateTime, "PPP")}
              </span>
            </div>
          )}

          {request.status === "rejected" && request.rejectionReason && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Reason for rejection:</p>
                <p>{request.rejectionReason}</p>
              </div>
            </div>
          )}

          {request.status === "pending" && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted text-sm">
              <Clock className="h-4 w-4 mt-0.5" />
              <p>
                Your consultation request is pending. The lawyer will review and respond soon.
              </p>
            </div>
          )}

          {request.acceptedAt && (
            <div className="text-xs text-muted-foreground">
              Accepted {format(request.acceptedAt, "PPP 'at' p")}
            </div>
          )}

          {request.completedAt && (
            <div className="text-xs text-muted-foreground">
              Completed {format(request.completedAt, "PPP 'at' p")}
            </div>
          )}

          {canChat && (
            <Button
              onClick={() => handleOpenChat(request)}
              className="w-full"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Open Chat
            </Button>
          )}

          {request.status === "completed" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // TODO: Implement review functionality
                toast({
                  title: "Coming Soon",
                  description: "Review functionality will be available soon",
                });
              }}
            >
              Leave a Review
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Please sign in to view your dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="py-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeRequests = requests.filter(
    (r) => r.status === "pending" || r.status === "accepted" || r.status === "in-progress"
  );
  const pastRequests = requests.filter(
    (r) => r.status === "completed" || r.status === "rejected" || r.status === "cancelled"
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold">My Consultations</h1>
        <p className="text-muted-foreground text-lg">
          View and manage your legal consultation requests
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Active Requests</h2>
        <Button onClick={() => router.push("/lawyers")}>
          Request New Consultation
        </Button>
      </div>

      {activeRequests.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="py-8 text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have any active consultation requests
            </p>
            <Button onClick={() => router.push("/lawyers")}>
              Browse Lawyers
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {activeRequests.map(renderRequestCard)}
        </div>
      )}

      {pastRequests.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-6">Past Consultations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastRequests.map(renderRequestCard)}
          </div>
        </>
      )}
    </div>
  );
}
