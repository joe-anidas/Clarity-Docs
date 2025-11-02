"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConsultationRequest, ConsultationStatus } from "@/types/consultation";
import {
  getLawyerConsultationRequests,
  updateConsultationStatus,
  getChatSessionByRequestId,
} from "@/lib/chat-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  FileText, 
  Calendar,
  Loader2,
  AlertTriangle,
  Upload,
  ShieldCheck,
  User,
  Settings
} from "lucide-react";
import { format } from "date-fns";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LawyerDashboardPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningRequestId, setActioningRequestId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [loadingVerification, setLoadingVerification] = useState(true);
  const [lawyerProfile, setLawyerProfile] = useState<any>(null);
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Role-based access control
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    } else if (!loading && user && userRole !== 'lawyer' && userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You need a lawyer account to access this page",
        variant: "destructive",
      });
      router.push('/dashboard/user');
    }
  }, [user, userRole, loading, router, toast]);

  useEffect(() => {
    if (user && (userRole === 'lawyer' || userRole === 'admin')) {
      loadRequests();
      loadVerificationStatus();
    }
  }, [user]);

  const loadVerificationStatus = async () => {
    if (!user) return;
    
    setLoadingVerification(true);
    try {
      const profileRef = doc(db, 'lawyerProfiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        setLawyerProfile(profileData);
        const status = profileData.verificationStatus || 'none';
        setVerificationStatus(status);
      } else {
        setVerificationStatus('none');
        setLawyerProfile(null);
      }
    } catch (error) {
      console.error("Error loading verification status:", error);
    } finally {
      setLoadingVerification(false);
    }
  };

  const loadRequests = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await getLawyerConsultationRequests(user.uid);
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

  const handleAccept = async (request: ConsultationRequest) => {
    setActioningRequestId(request.id);
    try {
      const result = await updateConsultationStatus(request.id, "accepted");
      if (result.success) {
        toast({
          title: "Request Accepted",
          description: "A chat session has been created. You can now communicate with the client.",
        });
        await loadRequests();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    } finally {
      setActioningRequestId(null);
    }
  };

  const handleReject = (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    
    setActioningRequestId(selectedRequest.id);
    try {
      const result = await updateConsultationStatus(
        selectedRequest.id,
        "rejected",
        "Unavailable at this time"
      );
      if (result.success) {
        toast({
          title: "Request Rejected",
          description: "The client has been notified.",
        });
        await loadRequests();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setActioningRequestId(null);
      setRejectDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleOpenChat = async (request: ConsultationRequest) => {
    try {
      const session = await getChatSessionByRequestId(request.id);
      if (session) {
        router.push(`/chat/${session.id}`);
      } else {
        toast({
          title: "Error",
          description: "Chat session not found",
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
  };

  const handleCompleteConsultation = async (request: ConsultationRequest) => {
    setActioningRequestId(request.id);
    try {
      const result = await updateConsultationStatus(request.id, "completed");
      if (result.success) {
        toast({
          title: "Consultation Completed",
          description: "The consultation has been marked as completed.",
        });
        await loadRequests();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete consultation",
        variant: "destructive",
      });
    } finally {
      setActioningRequestId(null);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      low: "secondary",
      medium: "default",
      high: "destructive",
    } as const;
    return (
      <Badge variant={variants[urgency as keyof typeof variants] || "default"}>
        {urgency}
      </Badge>
    );
  };

  const getStatusBadge = (status: ConsultationStatus) => {
    const config = {
      pending: { icon: Clock, variant: "secondary" as const, label: "Pending" },
      accepted: { icon: CheckCircle, variant: "default" as const, label: "Accepted" },
      rejected: { icon: XCircle, variant: "destructive" as const, label: "Rejected" },
      "in-progress": { icon: MessageSquare, variant: "default" as const, label: "In Progress" },
      completed: { icon: CheckCircle, variant: "secondary" as const, label: "Completed" },
      cancelled: { icon: XCircle, variant: "secondary" as const, label: "Cancelled" },
    };

    const { icon: Icon, variant, label } = config[status] || config.pending;
    
    return (
      <Badge variant={variant}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const renderRequestCard = (request: ConsultationRequest) => {
    const isActioning = actioningRequestId === request.id;

    return (
      <Card key={request.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{request.userName}</CardTitle>
              <CardDescription>{request.userEmail}</CardDescription>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {getStatusBadge(request.status)}
              {getUrgencyBadge(request.urgency)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Message:</p>
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

          <div className="text-xs text-muted-foreground">
            Requested {format(request.createdAt, "PPP 'at' p")}
          </div>

          <div className="flex gap-2">
            {request.status === "pending" && (
              <>
                <Button
                  onClick={() => handleAccept(request)}
                  disabled={isActioning || verificationStatus !== 'approved'}
                  size="sm"
                  title={verificationStatus !== 'approved' ? 'Complete verification to accept requests' : ''}
                >
                  {isActioning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(request)}
                  disabled={isActioning}
                  size="sm"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}

            {(request.status === "accepted" || request.status === "in-progress") && (
              <>
                <Button
                  onClick={() => handleOpenChat(request)}
                  size="sm"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Chat
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCompleteConsultation(request)}
                  disabled={isActioning}
                  size="sm"
                >
                  {isActioning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Mark Complete"
                  )}
                </Button>
              </>
            )}
          </div>
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

  // Show access denied message
  if (!user || (userRole !== 'lawyer' && userRole !== 'admin')) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <strong>Access Denied:</strong> You need a lawyer account to access this page.
            <br />
            <span className="text-sm">Please upgrade your role in Firebase Console or contact an administrator.</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
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

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const activeRequests = requests.filter(
    (r) => r.status === "accepted" || r.status === "in-progress"
  );
  const completedRequests = requests.filter(
    (r) => r.status === "completed" || r.status === "rejected"
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Profile Avatar with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                  <Avatar className="h-16 w-16 border-2 border-primary cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage 
                      src={lawyerProfile?.profilePhoto || user?.photoURL || ''} 
                      alt={lawyerProfile?.name || user?.displayName || 'Lawyer'} 
                    />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {(lawyerProfile?.name || user?.displayName || 'L')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start" sideOffset={8}>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{lawyerProfile?.name || user?.displayName || 'Lawyer Profile'}</h3>
                    <p className="text-sm text-muted-foreground">{lawyerProfile?.email || user?.email}</p>
                  </div>
                  
                  {verificationStatus === 'approved' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="font-medium">Verified Lawyer</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Menu Options */}
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-accent"
                    onClick={() => router.push('/dashboard/lawyer/profile')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-accent"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold">Lawyer Dashboard</h1>
                {verificationStatus === 'approved' && (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg mt-1">
                Manage your consultation requests and client communications
              </p>
            </div>
          </div>
          
          {/* Upload Document Button */}
          <Button 
            variant="outline"
            onClick={() => router.push('/clarity')}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Verification Status Card */}
      {!loadingVerification && (
        <Card className={`mb-6 ${verificationStatus === 'approved' ? 'border-green-500' : verificationStatus === 'pending' ? 'border-yellow-500' : verificationStatus === 'rejected' ? 'border-red-500' : 'border-blue-500'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {verificationStatus === 'approved' ? (
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                ) : verificationStatus === 'pending' ? (
                  <Clock className="h-6 w-6 text-yellow-600" />
                ) : verificationStatus === 'rejected' ? (
                  <XCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <Upload className="h-6 w-6 text-blue-600" />
                )}
                <div>
                  <CardTitle>
                    {verificationStatus === 'approved' ? 'Verified Lawyer' : 
                     verificationStatus === 'pending' ? 'Verification Pending' : 
                     verificationStatus === 'rejected' ? 'Verification Rejected' : 
                     'Verification Required'}
                  </CardTitle>
                  <CardDescription>
                    {verificationStatus === 'approved' ? 'You are verified and can accept consultation requests' : 
                     verificationStatus === 'pending' ? 'Your documents are under admin review' : 
                     verificationStatus === 'rejected' ? 'Your verification was rejected. Please resubmit.' : 
                     'Upload your credentials to start accepting consultations'}
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/lawyer-verification')}
                variant={verificationStatus === 'approved' ? 'outline' : 'default'}
              >
                <Upload className="mr-2 h-4 w-4" />
                {verificationStatus === 'approved' ? 'View Documents' : 'Upload Documents'}
              </Button>
            </div>
          </CardHeader>
          {verificationStatus !== 'approved' && (
            <CardContent>
              <Alert variant={verificationStatus === 'rejected' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {verificationStatus === 'pending' 
                    ? 'You can view consultation requests, but cannot accept them until verified by an admin.'
                    : verificationStatus === 'rejected'
                    ? 'Your verification was rejected. Please review admin feedback and resubmit your documents.'
                    : 'You must complete verification before accepting consultation requests.'}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending consultation requests
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map(renderRequestCard)
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active consultations
              </CardContent>
            </Card>
          ) : (
            activeRequests.map(renderRequestCard)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No completed consultations
              </CardContent>
            </Card>
          ) : (
            completedRequests.map(renderRequestCard)
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Consultation Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this consultation request? The client will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject}>
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
