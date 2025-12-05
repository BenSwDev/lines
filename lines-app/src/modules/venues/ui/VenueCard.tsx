"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui";
import { formatDate } from "@/utils/date";
import type { Venue } from "@prisma/client";

export interface VenueCardProps {
  venue: Venue;
  onEnter: (venueId: string) => void;
  onDelete: (venue: Venue) => void;
}

export function VenueCard({ venue, onEnter, onDelete }: VenueCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{venue.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-400">נוצר ב: {formatDate(venue.createdAt)}</p>
          
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onEnter(venue.id)}
              className="flex-1"
            >
              כניסה למקום
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(venue)}
            >
              מחיקה
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

