"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LawyerProfile } from "@/types/lawyer";
import { LawyerList } from "@/components/lawyer/lawyer-list";
import { ConsultationRequestForm } from "@/components/lawyer/consultation-request-form";
import { getVerifiedLawyers } from "@/lib/lawyer-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/auth-provider";

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadLawyers();
  }, []);

  const loadLawyers = async () => {
    setIsLoading(true);
    try {
      console.log("Loading verified lawyers from /lawyers page...");
      const data = await getVerifiedLawyers();
      console.log(`Loaded ${data.length} verified lawyers:`, data);
      setLawyers(data);
    } catch (error) {
      console.error("Error loading lawyers:", error);
    } finally {
      setIsLoading(false);
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
    router.push("/dashboard/user");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold">Find a Lawyer</h1>
        <p className="text-muted-foreground text-lg">
          Connect with verified legal professionals for expert consultation
        </p>
      </div>

      <LawyerList
        lawyers={lawyers}
        onRequestConsultation={handleRequestConsultation}
      />

      {selectedLawyer && user && (
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
    </div>
  );
}
