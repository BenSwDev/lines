"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useTour } from "./TourProvider";
import { usePathname } from "next/navigation";
import type { TourPageId } from "../types";

/**
 * Button to start the guided tour
 * Automatically detects current page and starts tour for that page
 */
export function TourButton() {
  const { startTour, isActive, stopTour } = useTour();
  const pathname = usePathname();

  // Detect current page from pathname
  const getCurrentPageId = (): TourPageId | null => {
    if (pathname.includes("/lines")) return "lines";
    if (pathname.includes("/roles")) return "roles";
    if (pathname.includes("/settings/structure")) return "structure";
    if (pathname.includes("/menus")) return "menus";
    if (pathname.includes("/info")) return "info";
    if (pathname.includes("/calendar")) return "calendar";
    return null;
  };

  const handleClick = () => {
    if (isActive) {
      stopTour();
    } else {
      const pageId = getCurrentPageId();
      if (pageId) {
        startTour(pageId);
      }
    }
  };

  const pageId = getCurrentPageId();
  if (!pageId) return null;

  return (
    <Button
      onClick={handleClick}
      variant={isActive ? "destructive" : "outline"}
      size="sm"
      className="gap-2"
    >
      <Sparkles className="h-4 w-4" />
      {isActive ? "סיים הדרכה" : "התחל הדרכה"}
    </Button>
  );
}
