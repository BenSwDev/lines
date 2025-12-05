"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/Card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import type { Venue } from "@prisma/client";

export interface VenueCardProps {
  venue: Venue;
  onSelect: () => void;
  onDelete: () => void;
}

export function VenueCard({ venue, onSelect, onDelete }: VenueCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <Card className="cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20">
      <div onClick={onSelect}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{venue.name}</span>
            <span className="text-xs text-gray-500">🏢</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-xs text-gray-400">נוצר ב-{formatDate(venue.createdAt)}</p>
        </CardContent>
      </div>

      <div className="border-t border-gray-800 px-6 pb-4">
        <div className="flex gap-2 pt-3">
          <Button variant="default" size="sm" onClick={onSelect} className="flex-1">
            כניסה למקום →
          </Button>
          <Button
            variant={showDeleteConfirm ? "destructive" : "secondary"}
            size="sm"
            onClick={handleDelete}
            onBlur={() => setShowDeleteConfirm(false)}
          >
            {showDeleteConfirm ? "✓ אישור" : "🗑️"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
