"use client";

import React from "react";
import { VenueCard } from "./VenueCard";
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import type { Venue } from "@prisma/client";

export interface VenueListProps {
  venues: Venue[];
  onCreateClick: () => void;
  onEnterVenue: (venueId: string) => void;
  onDeleteVenue: (venue: Venue) => void;
}

export function VenueList({ venues, onCreateClick, onEnterVenue, onDeleteVenue }: VenueListProps) {
  if (venues.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="text-center space-y-4 py-8">
            <div className="text-5xl">🏢</div>
            <h2 className="text-2xl font-semibold text-gray-100">עדיין לא יצרת מקומות</h2>
            <p className="text-gray-400">
              התחל בניהול המקומות שלך על ידי יצירת המקום הראשון
            </p>
            <Button variant="primary" onClick={onCreateClick} className="mt-4">
              צור מקום ראשון
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {venues.map((venue) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          onEnter={onEnterVenue}
          onDelete={onDeleteVenue}
        />
      ))}
    </div>
  );
}

