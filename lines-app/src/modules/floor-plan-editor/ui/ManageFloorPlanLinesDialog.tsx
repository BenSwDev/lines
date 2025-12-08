"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/core/i18n/provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getVenueLines, updateFloorPlanLines } from "../actions/floorPlanActions";
import type { FloorPlanListItem } from "../types";

interface ManageFloorPlanLinesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  floorPlan: FloorPlanListItem;
  venueId: string;
  onSuccess?: () => void;
}

export function ManageFloorPlanLinesDialog({
  isOpen,
  onClose,
  floorPlan,
  venueId,
  onSuccess
}: ManageFloorPlanLinesDialogProps) {
  const { t } = useTranslations();
  const [allLines, setAllLines] = useState<{ id: string; name: string; color: string }[]>([]);
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load all lines for the venue
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getVenueLines(venueId)
        .then((result) => {
          if (result.success && result.data) {
            setAllLines(result.data);
            // Initialize selected lines from floor plan
            const currentLineIds = new Set(floorPlan.lines.map((fl) => fl.line.id));
            setSelectedLineIds(currentLineIds);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, venueId, floorPlan.lines]);

  const handleToggleLine = (lineId: string) => {
    setSelectedLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateFloorPlanLines({
        floorPlanId: floorPlan.id,
        lineIds: Array.from(selectedLineIds)
      });

      if (result.success) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("floorPlan.manageLines", { defaultValue: "ניהול ליינים למפה" })}: {floorPlan.name}
          </DialogTitle>
          <DialogDescription>
            {t("floorPlan.manageLinesDescription", {
              defaultValue: "בחר ליינים לשיוך למפה זו. כל ליין יכול להיות מקושר למפה אחת בלבד."
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : allLines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("floorPlan.noLinesAvailable", { defaultValue: "אין ליינים זמינים" })}
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {allLines.map((line) => {
                  const isSelected = selectedLineIds.has(line.id);
                  return (
                    <div
                      key={line.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        isSelected && "bg-muted"
                      )}
                    >
                      <Checkbox
                        id={`line-${line.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleLine(line.id)}
                      />
                      <Label
                        htmlFor={`line-${line.id}`}
                        className="flex-1 cursor-pointer flex items-center gap-2"
                      >
                        <Badge
                          variant="outline"
                          style={{ borderColor: line.color, color: line.color }}
                        >
                          {line.name}
                        </Badge>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {selectedLineIds.size > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
              <p className="text-blue-700 dark:text-blue-300">
                💡{" "}
                {t("floorPlan.lineLinkingNote", {
                  defaultValue:
                    "שימו לב: אם ליין כבר מקושר למפה אחרת, הוא יוסר מהמפה הקודמת ויקושר למפה זו."
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t("common.cancel", { defaultValue: "ביטול" })}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving
              ? t("floorPlan.saving", { defaultValue: "שומר..." })
              : t("common.save", { defaultValue: "שמור" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
