"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export default function LawyerVerificationPage() {
  const { user, userRole, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [documents, setDocuments] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: 'BAR-2024-12345',
    barAssociation: 'State Bar of California',
    yearsOfExperience: '8',
    specializations: 'Corporate Law, Contract Law, Intellectual Property',
    bio: 'Experienced attorney specializing in corporate law and intellectual property with over 8 years of practice. Licensed to practice in California and admitted to the State Bar since 2016. Dedicated to providing clear legal guidance and helping clients navigate complex legal matters.',
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    } else if (!loading && userRole !== 'lawyer') {
      router.push('/');
    } else if (user && userRole === 'lawyer') {
      checkVerificationStatus();
    }
  }, [user, userRole, loading, router]);

  const checkVerificationStatus = async () => {
    if (!user) return;
    
    try {
      const profileRef = doc(db, 'lawyerProfiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setVerificationStatus(data.verificationStatus || 'none');
        
        // Pre-fill form if data exists
        setFormData({
          name: data.name || user.displayName || '',
          licenseNumber: data.licenseNumber || 'BAR-2024-12345',
          barAssociation: data.barAssociation || 'State Bar of California',
          yearsOfExperience: data.yearsOfExperience?.toString() || '8',
          specializations: data.specializations?.join(', ') || 'Corporate Law, Contract Law, Intellectual Property',
          bio: data.bio || 'Experienced attorney specializing in corporate law and intellectual property with over 8 years of practice. Licensed to practice in California and admitted to the State Bar since 2016. Dedicated to providing clear legal guidance and helping clients navigate complex legal matters.',
        });
      } else {
        // Set user name from Google account
        setFormData(prev => ({
          ...prev,
          name: user.displayName || '',
        }));
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to submit verification request",
        variant: "destructive",
      });
      return;
    }

    // Validate form data
    if (!formData.name.trim() || !formData.licenseNumber.trim() || !formData.barAssociation.trim() || 
        !formData.yearsOfExperience || !formData.specializations.trim() || !formData.bio.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload documents to Firebase Storage (optional for testing)
      const documentUrls: string[] = [];
      if (documents.length > 0) {
        for (const file of documents) {
          const storageRef = ref(storage, `lawyer-verification/${user.uid}/${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          documentUrls.push(url);
        }
      }

      // Create/Update lawyer profile with verification request
      const profileRef = doc(db, 'lawyerProfiles', user.uid);
      await setDoc(profileRef, {
        id: user.uid,
        userId: user.uid,
        email: user.email,
        name: formData.name,
        licenseNumber: formData.licenseNumber,
        barAssociation: formData.barAssociation,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        specializations: formData.specializations.split(',').map(s => s.trim()),
        bio: formData.bio,
        verified: false,
        verificationStatus: 'pending',
        verificationDocuments: documentUrls,
        verificationRequestedAt: new Date().toISOString(),
        rating: 0,
        reviewCount: 0,
        hourlyRate: 0,
        currency: 'USD',
        availability: {},
        languages: ['English'],
        location: '',
        profilePhoto: user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setVerificationStatus('pending');
      toast({
        title: "Verification Request Submitted",
        description: "Your request has been submitted to admin for review",
      });
    } catch (error: any) {
      console.error("Error submitting verification:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'lawyer') {
    return null;
  }

  // Show status if already submitted
  if (verificationStatus === 'pending') {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-yellow-600" />
              <CardTitle>Verification Pending</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="text-sm">
                Your verification request is being reviewed by our admin team. 
                You'll be notified once the review is complete. This usually takes 1-2 business days.
              </AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => router.push('/dashboard/user')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'approved') {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>Verification Approved</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="text-sm">
                Congratulations! Your lawyer account has been verified. 
                You now have access to the lawyer dashboard.
              </AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => router.push('/dashboard/lawyer')}>
              Go to Lawyer Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <CardTitle>Verification Rejected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                Your verification request was not approved. Please review your documents and resubmit.
              </AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => setVerificationStatus('none')}>
              Submit New Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show verification form
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Lawyer Verification</CardTitle>
              <CardDescription>
                Submit your credentials and documents to get verified as a lawyer
              </CardDescription>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => {
                setFormData({
                  name: user?.displayName || 'John Smith',
                  licenseNumber: 'BAR-2024-12345',
                  barAssociation: 'State Bar of California',
                  yearsOfExperience: '8',
                  specializations: 'Corporate Law, Contract Law, Intellectual Property',
                  bio: 'Experienced attorney specializing in corporate law and intellectual property with over 8 years of practice. Licensed to practice in California and admitted to the State Bar since 2016. Dedicated to providing clear legal guidance and helping clients navigate complex legal matters.',
                });
                toast({
                  title: "Sample data filled",
                  description: "Form filled with sample values for testing",
                });
              }}
            >
              Fill Sample Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Required:</strong> You must upload valid legal credentials (bar license, registration certificate, etc.) 
              to access the lawyer dashboard and accept consultation requests.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Bar License Number *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barAssociation">Bar Association *</Label>
              <Input
                id="barAssociation"
                placeholder="e.g., California State Bar"
                value={formData.barAssociation}
                onChange={(e) => setFormData({ ...formData, barAssociation: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations * (comma-separated)</Label>
              <Input
                id="specializations"
                placeholder="e.g., Contract Law, Corporate Law"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell us about your legal experience..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documents">Verification Documents (PDF, JPG, PNG)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="documents"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileChange}
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              {documents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {documents.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload your bar license, registration certificate, or other legal credentials. 
                <strong className="text-blue-600"> Optional for testing - can submit without documents</strong>
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Verification'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
