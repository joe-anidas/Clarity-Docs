"use client";

import { LawyerProfile } from "@/types/lawyer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Briefcase, MessageSquare, Globe, DollarSign } from "lucide-react";

interface LawyerCardProps {
  lawyer: LawyerProfile;
  onRequestConsultation?: (lawyer: LawyerProfile) => void;
}

export function LawyerCard({ lawyer, onRequestConsultation }: LawyerCardProps) {
  const initials = lawyer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={lawyer.profilePhoto} alt={lawyer.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{lawyer.name}</CardTitle>
              {lawyer.verified && (
                <Badge variant="default" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{lawyer.rating.toFixed(1)}</span>
                <span>({lawyer.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{lawyer.location}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {lawyer.bio}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{lawyer.yearsOfExperience} years experience</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>
              {lawyer.currency}{lawyer.hourlyRate}/hour
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{lawyer.languages.join(", ")}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {lawyer.specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="text-xs">
              {spec}
            </Badge>
          ))}
          {lawyer.specializations.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{lawyer.specializations.length - 3} more
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>License: {lawyer.licenseNumber}</p>
          <p>{lawyer.barAssociation}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onRequestConsultation?.(lawyer)}
          className="w-full"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Request Consultation
        </Button>
      </CardFooter>
    </Card>
  );
}
