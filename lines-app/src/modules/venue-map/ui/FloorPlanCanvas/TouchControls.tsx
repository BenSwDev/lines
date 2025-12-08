/**
 * Touch Controls Component
 * Touch-friendly controls for mobile/tablet
 */

"use client";

import { useDevice } from "../../hooks";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Move } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";

interface TouchControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onRotate?: () => void;
  onPanToggle?: () => void;
  isPanning?: boolean;
  className?: string;
}

export function TouchControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onRotate,
  onPanToggle,
  isPanning = false,
  className = ""
}: TouchControlsProps) {
  const device = useDevice();
  const { t } = useTranslations();

  // Only show on mobile/tablet
  if (!device.hasTouch) return null;

  return (
    <div
      className={`fixed bottom-20 right-4 z-50 flex flex-col gap-2 ${className}`}
      style={{
        // Ensure buttons are large enough for touch (min 44x44px)
        minWidth: "44px",
        minHeight: "44px"
      }}
    >
      {onZoomIn && (
        <Button
          onClick={onZoomIn}
          size="lg"
          className="h-12 w-12 rounded-full shadow-lg touch-manipulation"
          aria-label={t("floorPlan.zoomIn") || "הגדל"}
        >
          <ZoomIn className="h-6 w-6" />
        </Button>
      )}

      {onZoomOut && (
        <Button
          onClick={onZoomOut}
          size="lg"
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg touch-manipulation"
          aria-label={t("floorPlan.zoomOut") || "הקטן"}
        >
          <ZoomOut className="h-6 w-6" />
        </Button>
      )}

      {onPanToggle && (
        <Button
          onClick={onPanToggle}
          size="lg"
          variant={isPanning ? "default" : "outline"}
          className="h-12 w-12 rounded-full shadow-lg touch-manipulation"
          aria-label={t("floorPlan.panMode") || "הזזה"}
        >
          <Move className="h-6 w-6" />
        </Button>
      )}

      {onRotate && (
        <Button
          onClick={onRotate}
          size="lg"
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg touch-manipulation"
          aria-label={t("floorPlan.rotate") || "סיבוב"}
        >
          <RotateCw className="h-6 w-6" />
        </Button>
      )}

      {onReset && (
        <Button
          onClick={onReset}
          size="sm"
          variant="outline"
          className="h-10 w-10 rounded-full shadow-lg touch-manipulation text-xs"
          aria-label={t("floorPlan.reset") || "איפוס"}
        >
          ↺
        </Button>
      )}
    </div>
  );
}

