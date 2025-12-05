"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Building2, ArrowRight, Trash2, MoreVertical, Calendar } from "lucide-react";
import { formatDate } from "@/utils/date";
import type { Venue } from "@prisma/client";

type VenueCardModernProps = {
  venue: Venue;
  onSelect: () => void;
  onDelete: () => void;
};

export function VenueCardModern({ venue, onSelect, onDelete }: VenueCardModernProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }
    onDelete();
  };

  return (
    <Card
      interactive
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
      onClick={onSelect}
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-none tracking-tight">{venue.name}</h3>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                נוצר {formatDate(venue.createdAt)}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">פתח תפריט</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSelect}>
                <ArrowRight className="ml-2 h-4 w-4" />
                כניסה למקום
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                {showDeleteConfirm ? "לחץ שוב לאישור" : "מחיקה"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              פעיל
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative">
        <Button variant="default" className="w-full" onClick={onSelect}>
          <ArrowRight className="ml-2 h-4 w-4" />
          כניסה לניהול
        </Button>
      </CardFooter>
    </Card>
  );
}
