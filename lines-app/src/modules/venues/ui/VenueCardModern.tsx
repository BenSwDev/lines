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
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background via-background to-primary/5 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Decorative corner accent */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-2xl transition-all duration-500 group-hover:scale-150" />

      {/* Animated border glow */}
      <div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)",
          animation: "shimmer 3s infinite"
        }}
      />

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Icon with animated glow */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Building2 className="h-7 w-7 text-white drop-shadow-lg" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                {venue.name}
              </h3>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>נוצר {formatDate(venue.createdAt)}</span>
              </p>
            </div>
          </div>

          {/* Actions Menu - more subtle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg opacity-60 transition-all hover:opacity-100 hover:bg-primary/10"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">פתח תפריט</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onSelect} className="cursor-pointer">
                <ArrowRight className="ml-2 h-4 w-4" />
                כניסה למקום
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                {showDeleteConfirm ? "לחץ שוב לאישור" : "מחיקה"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-green-500/20 blur-sm" />
            <Badge className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md border-0">
              פעיל
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative z-10 pt-4">
        <Button
          variant="default"
          className="w-full bg-gradient-to-r from-primary to-primary/90 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold"
          onClick={onSelect}
        >
          <span>כניסה לניהול</span>
          <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
