"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  FileText,
  Loader2,
  Download,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Star,
  Globe,
  Clock,
  Shield,
  User as UserIcon,
  Award,
  Languages as LanguagesIcon
} from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
import Link from "next/link";

export default function LawyerDetailPage() {
  const [lawyer, setLawyer] = useState<LawyerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const lawyerId = params.id as string;

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
    if (user && userRole === 'admin' && lawyerId) {
      loadLawyerDetails();
    }
  }, [user, userRole, lawyerId]);

  const loadLawyerDetails = async () => {
    setIsLoading(true);
    try {
      const profileRef = doc(db, 'lawyerProfiles', lawyerId);
      const snapshot = await getDoc(profileRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        const lawyerData = {
          ...data,
          id: snapshot.id,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
          verificationRequestedAt: data.verificationRequestedAt ? new Date(data.verificationRequestedAt) : undefined,
          verificationCompletedAt: data.verificationCompletedAt ? new Date(data.verificationCompletedAt) : undefined,
        } as LawyerProfile;
        
        setLawyer(lawyerData);
        setReviewNotes(lawyerData.verificationNotes || '');
      } else {
        toast({
          title: "Not Found",
          description: "Lawyer profile not found",
          variant: "destructive",
        });
        router.push('/dashboard/admin');
      }
    } catch (error) {
      console.error("Error loading lawyer details:", error);
      toast({
        title: "Error",
        description: "Failed to load lawyer details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAction = (action: 'approve' | 'reject') => {
    setReviewAction(action);
    setShowReviewDialog(true);
  };

  const confirmReview = async () => {
    if (!lawyer || !reviewAction) return;
    
    setIsActioning(true);
    try {
      const profileRef = doc(db, 'lawyerProfiles', lawyer.id);
      await updateDoc(profileRef, {
        verificationStatus: reviewAction === 'approve' ? 'approved' : 'rejected',
        verified: reviewAction === 'approve',
        verificationCompletedAt: new Date().toISOString(),
        verificationNotes: reviewNotes,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: reviewAction === 'approve' ? "Lawyer Approved" : "Lawyer Rejected",
        description: `Verification request has been ${reviewAction === 'approve' ? 'approved' : 'rejected'}`,
      });

      setShowReviewDialog(false);
      setReviewAction(null);
      await loadLawyerDetails();
    } catch (error) {
      console.error("Error updating verification:", error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setIsActioning(false);
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
      <Badge variant={variant} className="text-sm">
        <Icon className="mr-1 h-4 w-4" />
        {label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadDocument = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `lawyer_document_${index + 1}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Download Started",
        description: "Document download has started",
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
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

  if (!user || userRole !== 'admin' || !lawyer) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/admin')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Lawyer Details</h1>
            <p className="text-muted-foreground">Complete profile and verification information</p>
          </div>
          {getStatusBadge(lawyer.verificationStatus)}
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 ring-4 ring-primary/10">
                  <AvatarImage src={lawyer.profilePhoto} alt={lawyer.name} />
                  <AvatarFallback className="text-2xl">{getInitials(lawyer.name)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{lawyer.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{lawyer.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.yearsOfExperience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.currency} {lawyer.hourlyRate}/hour</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{lawyer.rating.toFixed(1)} ({lawyer.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">License Number</Label>
                <p className="text-lg font-medium">{lawyer.licenseNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Bar Association</Label>
                <p className="text-lg font-medium">{lawyer.barAssociation}</p>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground mb-2 block">Specializations</Label>
              <div className="flex flex-wrap gap-2">
                {lawyer.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary">
                    <Award className="mr-1 h-3 w-3" />
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground mb-2 block">Languages</Label>
              <div className="flex flex-wrap gap-2">
                {lawyer.languages.map((lang, index) => (
                  <Badge key={index} variant="outline">
                    <LanguagesIcon className="mr-1 h-3 w-3" />
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground mb-2 block">Biography</Label>
              <p className="text-sm leading-relaxed">{lawyer.bio}</p>
            </div>
          </CardContent>
        </Card>

        {/* Verification Documents */}
        {lawyer.verificationDocuments && lawyer.verificationDocuments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Verification Documents
              </CardTitle>
              <CardDescription>
                Uploaded proof documents for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lawyer.verificationDocuments.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Document {index + 1}</p>
                      <p className="text-sm text-muted-foreground">Verification proof</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(url, index)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Verification Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Verification Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Profile Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(lawyer.createdAt)}</p>
                </div>
              </div>

              {lawyer.verificationRequestedAt && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Verification Requested</p>
                    <p className="text-sm text-muted-foreground">{formatDate(lawyer.verificationRequestedAt)}</p>
                  </div>
                </div>
              )}

              {lawyer.verificationCompletedAt && (
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    lawyer.verificationStatus === 'approved' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {lawyer.verificationStatus === 'approved' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {lawyer.verificationStatus === 'approved' ? 'Approved' : 'Rejected'}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(lawyer.verificationCompletedAt)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">{formatDate(lawyer.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Notes</CardTitle>
            <CardDescription>
              Internal notes and verification comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add notes about this lawyer profile..."
              rows={4}
              className="mb-3"
            />
            {lawyer.verificationNotes && lawyer.verificationNotes !== reviewNotes && (
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Previous Notes:</strong> {lawyer.verificationNotes}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {lawyer.verificationStatus === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Actions</CardTitle>
              <CardDescription>
                Review the information above and approve or reject this lawyer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={() => handleReviewAction('approve')}
                  disabled={isActioning}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Approve Lawyer
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                  onClick={() => handleReviewAction('reject')}
                  disabled={isActioning}
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Reject Request
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
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
          <div className="py-4">
            <Alert>
              <AlertDescription>
                {reviewAction === 'approve' 
                  ? 'Please ensure all documents have been verified before approving.'
                  : 'The lawyer will be notified of the rejection and can submit a new request.'}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewDialog(false);
                setReviewAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReview}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              disabled={isActioning}
            >
              {isActioning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {reviewAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
