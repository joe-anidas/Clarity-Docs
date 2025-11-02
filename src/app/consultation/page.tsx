"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LawyerProfile } from "@/types/lawyer";
import { ConsultationRequest } from "@/types/consultation";
import { LawyerList } from "@/components/lawyer/lawyer-list";
import { ConsultationRequestForm } from "@/components/lawyer/consultation-request-form";
import { getVerifiedLawyers } from "@/lib/lawyer-actions";
import { getUserConsultationRequests } from "@/lib/chat-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/auth-provider";
import { Clock, CheckCircle, XCircle, MessageSquare, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export default function ConsultationPage() {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [isLoadingLawyers, setIsLoadingLawyers] = useState(true);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    } else if (user) {
      loadLawyers();
      loadConsultations();
    }
  }, [user, loading, router]);

  const loadLawyers = async () => {
    setIsLoadingLawyers(true);
    try {
      console.log("Loading verified lawyers...");
      const data = await getVerifiedLawyers();
      console.log(`Loaded ${data.length} verified lawyers:`, data);
      setLawyers(data);
    } catch (error) {
      console.error("Error loading lawyers:", error);
    } finally {
      setIsLoadingLawyers(false);
    }
  };

  const loadConsultations = async () => {
    if (!user) return;
    
    setIsLoadingConsultations(true);
    try {
      const data = await getUserConsultationRequests(user.uid);
      setConsultations(data);
    } catch (error) {
      console.error("Error loading consultations:", error);
    } finally {
      setIsLoadingConsultations(false);
    }
  };

  const handleRequestConsultation = (lawyer: LawyerProfile) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    setSelectedLawyer(lawyer);
    setShowRequestForm(true);
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
    setSelectedLawyer(null);
    loadConsultations();
  };

  const handleOpenChat = async (request: ConsultationRequest) => {
    if (!user) return;
    
    try {
      const { getChatSessionByRequestId } = await import('@/lib/chat-actions');
      const session = await getChatSessionByRequestId(request.id, user.uid);
      if (session) {
        router.push(`/chat/${session.id}`);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { icon: Clock, variant: "secondary" as const, label: "Pending" },
      accepted: { icon: CheckCircle, variant: "default" as const, label: "Accepted" },
      rejected: { icon: XCircle, variant: "destructive" as const, label: "Rejected" },
      "in-progress": { icon: MessageSquare, variant: "default" as const, label: "In Progress" },
      completed: { icon: CheckCircle, variant: "secondary" as const, label: "Completed" },
      cancelled: { icon: XCircle, variant: "secondary" as const, label: "Cancelled" },
    };

    const { icon: Icon, variant, label } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge variant={variant}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Legal Consultation</h1>
        <p className="text-muted-foreground text-lg">
          Find lawyers and manage your consultation requests
        </p>
      </div>

      <Tabs defaultValue="find-lawyers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="find-lawyers">Find Lawyers</TabsTrigger>
          <TabsTrigger value="history">
            Consultation History ({consultations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="find-lawyers" className="space-y-6">
          {isLoadingLawyers ? (
            <Card>
              <CardContent className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-48" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : lawyers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No verified lawyers available at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <LawyerList
                lawyers={lawyers}
                onRequestConsultation={handleRequestConsultation}
              />
              {showRequestForm && selectedLawyer && (
                <ConsultationRequestForm
                  lawyer={selectedLawyer}
                  userId={user.uid}
                  userName={user.displayName || user.email || "User"}
                  userEmail={user.email || ""}
                  open={showRequestForm}
                  onOpenChange={setShowRequestForm}
                  onSuccess={handleRequestSuccess}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoadingConsultations ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="py-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : consultations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No consultation requests yet
                </p>
                <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="find-lawyers"]')?.click()}>
                  Find a Lawyer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {consultations.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          Consultation with {request.lawyerName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Requested {format(request.createdAt, "PPP 'at' p")}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Message:</p>
                      <p className="text-sm leading-relaxed">{request.message}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {request.documentName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md">
                          <FileText className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">{request.documentName}</span>
                        </div>
                      )}

                      {request.preferredDateTime && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(request.preferredDateTime, "PPP")}
                          </span>
                        </div>
                      )}
                    </div>

                    {(request.status === "accepted" || request.status === "in-progress") && (
                      <div className="pt-2">
                        <Button onClick={() => handleOpenChat(request)} size="sm" className="w-full sm:w-auto">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Open Chat
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
