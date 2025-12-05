"use client";

import { VenueCardModern } from "./VenueCardModern";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import type { Venue } from "@prisma/client";

type VenueGridProps = {
  venues: Venue[];
  onSelect: (venueId: string) => void;
  onDelete: (venueId: string) => void;
  onCreate: () => void;
};

export function VenueGrid({ venues, onSelect, onDelete, onCreate }: VenueGridProps) {
  if (venues.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md space-y-6 rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">אין מקומות עדיין</h3>
            <p className="text-muted-foreground">
              התחל בניהול המקומות שלך על ידי יצירת המקום העסקי הראשון
            </p>
          </div>
          <Button size="lg" onClick={onCreate}>
            <Plus className="ml-2 h-5 w-5" />
            צור מקום ראשון
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue) => (
        <VenueCardModern
          key={venue.id}
          venue={venue}
          onSelect={() => onSelect(venue.id)}
          onDelete={() => onDelete(venue.id)}
        />
      ))}
    </div>
  );
}

