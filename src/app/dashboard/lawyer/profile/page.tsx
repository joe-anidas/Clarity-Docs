"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award,
  Calendar,
  FileText,
  Globe,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Edit
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";

export default function LawyerProfilePage() {
  const [lawyerProfile, setLawyerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const profileRef = doc(db, 'lawyerProfiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        setLawyerProfile(profileSnap.data());
      } else {
        toast({
          title: "Profile Not Found",
          description: "Please complete your profile setup",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (loading || isLoading) {
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
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!lawyerProfile) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Profile not found. Please complete your profile setup.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const verificationStatus = lawyerProfile.verificationStatus || 'none';

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage 
                src={lawyerProfile.profilePhoto || user?.photoURL || ''} 
                alt={lawyerProfile.name || 'Lawyer'} 
              />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {(lawyerProfile.name || 'L')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{lawyerProfile.name}</h1>
                {verificationStatus === 'approved' && (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg">{lawyerProfile.email}</p>
            </div>
          </div>

          <Button onClick={() => router.push('/settings')}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {lawyerProfile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{lawyerProfile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lawyerProfile.licenseNumber && (
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">License Number</p>
                    <p className="text-sm text-muted-foreground">{lawyerProfile.licenseNumber}</p>
                  </div>
                </div>
              )}

              {lawyerProfile.barAssociation && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bar Association</p>
                    <p className="text-sm text-muted-foreground">{lawyerProfile.barAssociation}</p>
                  </div>
                </div>
              )}

              {lawyerProfile.yearsOfExperience && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Years of Experience</p>
                    <p className="text-sm text-muted-foreground">{lawyerProfile.yearsOfExperience} years</p>
                  </div>
                </div>
              )}

              {lawyerProfile.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{lawyerProfile.location}</p>
                  </div>
                </div>
              )}

              {lawyerProfile.languages && lawyerProfile.languages.length > 0 && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Languages</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {lawyerProfile.languages.map((lang: string, index: number) => (
                        <Badge key={index} variant="secondary">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specializations */}
          {lawyerProfile.specializations && lawyerProfile.specializations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lawyerProfile.specializations.map((spec: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Documents */}
          {verificationStatus === 'approved' && lawyerProfile.verificationDocuments && lawyerProfile.verificationDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
                <CardDescription>Documents proving your professional credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {lawyerProfile.verificationDocuments.map((docUrl: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(docUrl, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Verification Document {index + 1}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          {lawyerProfile.hourlyRate && (
            <Card>
              <CardHeader>
                <CardTitle>Consultation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {lawyerProfile.currency || '$'}{lawyerProfile.hourlyRate}
                  <span className="text-lg font-normal text-muted-foreground">/hour</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating */}
          {lawyerProfile.rating && (
            <Card>
              <CardHeader>
                <CardTitle>Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold">{lawyerProfile.rating.toFixed(1)}</div>
                    <div className="text-yellow-500">★★★★★</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {lawyerProfile.reviewCount || 0} reviews
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Status */}
          <Card className={verificationStatus === 'approved' ? 'border-green-500' : verificationStatus === 'pending' ? 'border-yellow-500' : 'border-red-500'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className={`h-5 w-5 ${
                  verificationStatus === 'approved' ? 'text-green-600' : 
                  verificationStatus === 'pending' ? 'text-yellow-600' : 
                  'text-red-600'
                }`} />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={
                  verificationStatus === 'approved' ? 'default' : 
                  verificationStatus === 'pending' ? 'secondary' : 
                  'destructive'
                }
                className={verificationStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {verificationStatus === 'approved' ? 'Verified' : 
                 verificationStatus === 'pending' ? 'Pending Review' : 
                 verificationStatus === 'rejected' ? 'Rejected' : 
                 'Not Verified'}
              </Badge>
              
              {verificationStatus === 'approved' && lawyerProfile.verificationCompletedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Verified on {format(new Date(lawyerProfile.verificationCompletedAt), "PPP")}
                </p>
              )}
              
              {verificationStatus !== 'approved' && (
                <Button 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={() => router.push('/lawyer-verification')}
                >
                  {verificationStatus === 'none' ? 'Get Verified' : 'View Status'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Member Since */}
          {lawyerProfile.createdAt && (
            <Card>
              <CardHeader>
                <CardTitle>Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {format(new Date(lawyerProfile.createdAt), "MMMM yyyy")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
