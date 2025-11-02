"use client";

import { useState } from "react";
import { LawyerProfile, SPECIALIZATIONS } from "@/types/lawyer";
import { ConsultationFilters } from "@/types/consultation";
import { LawyerCard } from "./lawyer-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

interface LawyerListProps {
  lawyers: LawyerProfile[];
  onRequestConsultation?: (lawyer: LawyerProfile) => void;
}

export function LawyerList({ lawyers, onRequestConsultation }: LawyerListProps) {
  const [filters, setFilters] = useState<ConsultationFilters>({
    searchQuery: "",
    specialization: undefined,
    minRating: 0,
    maxHourlyRate: 1000,
  });

  const filteredLawyers = lawyers.filter((lawyer) => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        lawyer.name.toLowerCase().includes(query) ||
        lawyer.bio.toLowerCase().includes(query) ||
        lawyer.specializations.some((s) => s.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Specialization
    if (filters.specialization && filters.specialization !== "all") {
      if (!lawyer.specializations.includes(filters.specialization)) {
        return false;
      }
    }

    // Rating
    if (filters.minRating && lawyer.rating < filters.minRating) {
      return false;
    }

    // Hourly rate
    if (filters.maxHourlyRate && lawyer.hourlyRate > filters.maxHourlyRate) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Lawyers
          </CardTitle>
          <CardDescription>
            Find the perfect lawyer for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name, specialization..."
                  className="pl-8"
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={filters.specialization || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    specialization: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="specialization">
                  <SelectValue placeholder="All specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">
                Minimum Rating: {filters.minRating || 0}+
              </Label>
              <Slider
                id="rating"
                min={0}
                max={5}
                step={0.5}
                value={[filters.minRating || 0]}
                onValueChange={([value]) =>
                  setFilters({ ...filters, minRating: value })
                }
              />
            </div>

            {/* Max Hourly Rate */}
            <div className="space-y-2">
              <Label htmlFor="rate">
                Max Rate: ${filters.maxHourlyRate || 1000}/hr
              </Label>
              <Slider
                id="rate"
                min={50}
                max={1000}
                step={50}
                value={[filters.maxHourlyRate || 1000]}
                onValueChange={([value]) =>
                  setFilters({ ...filters, maxHourlyRate: value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredLawyers.length} of {lawyers.length} lawyers
        </div>
        {filteredLawyers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No lawyers found matching your criteria. Try adjusting your filters.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                onRequestConsultation={onRequestConsultation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
