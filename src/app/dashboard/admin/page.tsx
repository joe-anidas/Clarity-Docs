"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck,
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Loader2,
  ExternalLink,
  AlertTriangle,
  User as UserIcon,
  Search
} from "lucide-react";
import { collection, getDocs, doc, updateDoc, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LawyerProfile } from "@/types/lawyer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminDashboardPage() {
  const [verificationRequests, setVerificationRequests] = useState<LawyerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    } else if (!loading && userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only admins can access this page",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [user, userRole, loading, router, toast]);

  useEffect(() => {
    if (user && userRole === 'admin') {
      loadVerificationRequests();
    }
  }, [user, userRole]);

  const loadVerificationRequests = async () => {
    setIsLoading(true);
    try {
      const profilesRef = collection(db, 'lawyerProfiles');
      const snapshot = await getDocs(profilesRef);
      
      const requests = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt) : new Date(),
        updatedAt: doc.data().updatedAt ? new Date(doc.data().updatedAt) : new Date(),
        verificationRequestedAt: doc.data().verificationRequestedAt ? new Date(doc.data().verificationRequestedAt) : undefined,
        verificationCompletedAt: doc.data().verificationCompletedAt ? new Date(doc.data().verificationCompletedAt) : undefined,
      })) as LawyerProfile[];
      
      setVerificationRequests(requests);
    } catch (error) {
      console.error("Error loading verification requests:", error);
      toast({
        title: "Error",
        description: "Failed to load verification requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAction = (lawyer: LawyerProfile, action: 'approve' | 'reject') => {
    setSelectedLawyer(lawyer);
    setReviewAction(action);
    setReviewNotes('');
  };

  const confirmReview = async () => {
    if (!selectedLawyer || !reviewAction) return;
    
    setActioningId(selectedLawyer.id);
    try {
      const profileRef = doc(db, 'lawyerProfiles', selectedLawyer.id);
      await updateDoc(profileRef, {
        verificationStatus: reviewAction === 'approve' ? 'approved' : 'rejected',
        verified: reviewAction === 'approve',
        verificationCompletedAt: Timestamp.now(),
        verificationNotes: reviewNotes,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: reviewAction === 'approve' ? "Lawyer Approved" : "Lawyer Rejected",
        description: `Verification request has been ${reviewAction === 'approve' ? 'approved' : 'rejected'}`,
      });

      setSelectedLawyer(null);
      setReviewAction(null);
      setReviewNotes('');
      await loadVerificationRequests();
    } catch (error) {
      console.error("Error updating verification:", error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { icon: Clock, variant: "secondary" as const, label: "Pending Review" },
      approved: { icon: CheckCircle, variant: "default" as const, label: "Approved" },
      rejected: { icon: XCircle, variant: "destructive" as const, label: "Rejected" },
    };

    const { icon: Icon, variant, label } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge variant={variant}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const renderLawyerCard = (lawyer: LawyerProfile) => {
    const isActioning = actioningId === lawyer.id;

    return (
      <Card 
        key={lawyer.id} 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => router.push(`/dashboard/admin/lawyers/${lawyer.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                {lawyer.name}
              </CardTitle>
              <CardDescription>{lawyer.email}</CardDescription>
            </div>
            {getStatusBadge(lawyer.verificationStatus)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">License Number</p>
              <p className="font-medium">{lawyer.licenseNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bar Association</p>
              <p className="font-medium">{lawyer.barAssociation}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Experience</p>
              <p className="font-medium">{lawyer.yearsOfExperience} years</p>
            </div>
            <div>
              <p className="text-muted-foreground">Specializations</p>
              <p className="font-medium">{lawyer.specializations.join(', ')}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Bio:</p>
            <p className="text-sm line-clamp-2">{lawyer.bio}</p>
          </div>

          {lawyer.verificationDocuments && lawyer.verificationDocuments.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Documents:</p>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span>{lawyer.verificationDocuments.length} document(s) uploaded</span>
              </div>
            </div>
          )}

          {lawyer.verificationStatus === 'pending' && (
            <div className="pt-2">
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/admin/lawyers/${lawyer.id}`);
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Review Details
              </Button>
            </div>
          )}

          {lawyer.verificationStatus !== 'pending' && (
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/dashboard/admin/lawyers/${lawyer.id}`);
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return null;
  }

  // Filter function for search
  const filterLawyers = (lawyers: LawyerProfile[]) => {
    if (!searchQuery.trim()) return lawyers;
    
    const query = searchQuery.toLowerCase();
    return lawyers.filter(lawyer => 
      lawyer.name.toLowerCase().includes(query) ||
      lawyer.licenseNumber.toLowerCase().includes(query) ||
      lawyer.email.toLowerCase().includes(query)
    );
  };

  const pendingRequests = filterLawyers(verificationRequests.filter(r => r.verificationStatus === 'pending'));
  const approvedRequests = filterLawyers(verificationRequests.filter(r => r.verificationStatus === 'approved'));
  const rejectedRequests = filterLawyers(verificationRequests.filter(r => r.verificationStatus === 'rejected'));

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage lawyer verification requests and system administration
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, license number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Admin Access:</strong> Review lawyer verification requests carefully. 
          Approved lawyers will have access to accept consultations and communicate with clients.
        </AlertDescription>
      </Alert>

      {searchQuery && (
        <Alert className="mb-6">
          <Search className="h-4 w-4" />
          <AlertDescription>
            Showing results for: <strong>{searchQuery}</strong>
            {' · '}
            Found {pendingRequests.length + approvedRequests.length + rejectedRequests.length} lawyer(s)
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchQuery ? (
                  <>
                    <p className="mb-2">No pending requests match your search</p>
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </>
                ) : (
                  'No pending verification requests'
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingRequests.map(renderLawyerCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchQuery ? (
                  <>
                    <p className="mb-2">No approved lawyers match your search</p>
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </>
                ) : (
                  'No approved lawyers yet'
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {approvedRequests.map(renderLawyerCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {searchQuery ? (
                  <>
                    <p className="mb-2">No rejected requests match your search</p>
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </>
                ) : (
                  'No rejected requests'
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rejectedRequests.map(renderLawyerCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedLawyer} onOpenChange={() => {
        setSelectedLawyer(null);
        setReviewAction(null);
        setReviewNotes('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Lawyer Verification
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? 'This lawyer will be able to access the lawyer dashboard and accept consultations.'
                : 'This lawyer will not be able to access lawyer features. They can resubmit their request.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedLawyer(null);
                setReviewAction(null);
                setReviewNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReview}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              disabled={!!actioningId}
            >
              {actioningId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {reviewAction === 'approve' ? 'Approve Lawyer' : 'Reject Request'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
