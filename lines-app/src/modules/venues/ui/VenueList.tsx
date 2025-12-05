"use client";

import React from "react";
import { VenueCard } from "./VenueCard";
import type { Venue } from "@prisma/client";

export interface VenueListProps {
  venues: Venue[];
  onSelect: (venueId: string) => void;
  onDelete: (venueId: string) => void;
}

export function VenueList({ venues, onSelect, onDelete }: VenueListProps) {

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          onSelect={() => onSelect(venue.id)}
          onDelete={() => onDelete(venue.id)}
        />
      ))}
    </div>
  );
}
