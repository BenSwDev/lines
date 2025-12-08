/**
 * Contextual Toolbar Component
 * Shows different tools based on context (empty, element selected, etc.)
 */

"use client";

import { Button } from "@/components/ui/button";
import { AlignLeft, AlignCenter, AlignRight, Copy, Trash2, Layers, Group } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import { useDevice } from "../../hooks";
import type { FloorPlanElement } from "../../types";

interface ContextualToolbarProps {
  selectedElements: FloorPlanElement[];
  onAlign?: (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  onDistribute?: (type: "horizontal" | "vertical") => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  className?: string;
}

export function ContextualToolbar({
  selectedElements,
  onAlign,
  onDistribute,
  onDuplicate,
  onDelete,
  onGroup,
  className = ""
}: ContextualToolbarProps) {
  const { t } = useTranslations();
  const device = useDevice();

  const hasSelection = selectedElements.length > 0;
  const hasMultipleSelection = selectedElements.length > 1;

  // Don't show if no selection
  if (!hasSelection) return null;

  return (
    <div
      className={`flex items-center gap-2 p-2 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg ${className}`}
      style={{
        position: "fixed",
        top: device.isMobile ? "auto" : "80px",
        bottom: device.isMobile ? "100px" : "auto",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000
      }}
    >
      {hasMultipleSelection && (
        <>
          {/* Alignment */}
          {onAlign && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAlign("left")}
                title={t("floorPlan.alignLeft") || "יישר שמאל"}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAlign("center")}
                title={t("floorPlan.alignCenter") || "יישר מרכז"}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAlign("right")}
                title={t("floorPlan.alignRight") || "יישר ימין"}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Distribution */}
          {onDistribute && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDistribute("horizontal")}
                title={t("floorPlan.distributeHorizontal") || "פיזור אופקי"}
              >
                <Layers className="h-4 w-4 rotate-90" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDistribute("vertical")}
                title={t("floorPlan.distributeVertical") || "פיזור אנכי"}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Group */}
          {onGroup && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={onGroup}
                title={t("floorPlan.group") || "קבץ"}
              >
                <Group className="h-4 w-4" />
              </Button>
            </>
          )}
        </>
      )}

      {/* Actions for single or multiple */}
      <div className="w-px h-6 bg-border mx-1" />
      {onDuplicate && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDuplicate}
          title={t("common.duplicate") || "שכפל"}
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}

      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          title={t("common.delete") || "מחק"}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
