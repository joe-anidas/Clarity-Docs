"use client";

import { useState } from "react";
import { LawyerProfile } from "@/types/lawyer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createConsultationRequest } from "@/lib/chat-actions";
import { useToast } from "@/hooks/use-toast";

interface ConsultationRequestFormProps {
  lawyer: LawyerProfile;
  userId: string;
  userName: string;
  userEmail: string;
  documentId?: string;
  documentName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConsultationRequestForm({
  lawyer,
  userId,
  userName,
  userEmail,
  documentId,
  documentName,
  open,
  onOpenChange,
  onSuccess,
}: ConsultationRequestFormProps) {
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [preferredDate, setPreferredDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please provide a message describing your consultation needs",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createConsultationRequest(
        userId,
        userName,
        userEmail,
        lawyer.id,
        lawyer.name,
        message,
        urgency,
        documentId,
        documentName,
        preferredDate
      );

      if (result.success) {
        toast({
          title: "Request Sent!",
          description: `Your consultation request has been sent to ${lawyer.name}. You'll be notified when they respond.`,
        });
        
        // Reset form
        setMessage("");
        setUrgency("medium");
        setPreferredDate(undefined);
        
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send consultation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Consultation with {lawyer.name}</DialogTitle>
            <DialogDescription>
              Provide details about your legal consultation needs. {lawyer.name} will review your request and respond soon.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Document info if provided */}
            {documentId && documentName && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">Related Document:</p>
                <p className="text-muted-foreground">{documentName}</p>
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Describe your legal consultation needs, questions, or concerns..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as possible to help the lawyer understand your needs
              </p>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={urgency}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setUrgency(value)
                }
              >
                <SelectTrigger id="urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - General inquiry</SelectItem>
                  <SelectItem value="medium">Medium - Need advice soon</SelectItem>
                  <SelectItem value="high">High - Urgent matter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Date/Time */}
            <div className="space-y-2">
              <Label>Preferred Consultation Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !preferredDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {preferredDate ? (
                      format(preferredDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={preferredDate}
                    onSelect={setPreferredDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Rate info */}
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Consultation Rate:</p>
              <p className="text-muted-foreground">
                {lawyer.currency}{lawyer.hourlyRate}/hour
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
