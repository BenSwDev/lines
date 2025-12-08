/**
 * Empty State Component
 * Shows when there are no elements on the map
 */

"use client";

import { MapPin, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslations } from "@/core/i18n/provider";
import { useDevice } from "../../hooks";

interface EmptyStateProps {
  onAddElement?: () => void;
  onUseTemplate?: () => void;
  className?: string;
}

export function EmptyState({
  onAddElement,
  onUseTemplate,
  className = ""
}: EmptyStateProps) {
  const { t } = useTranslations();
  const device = useDevice();

  return (
    <div
      className={`flex flex-col items-center justify-center h-full p-8 ${className}`}
    >
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">
            {t("floorPlan.emptyState.title") || "המפה שלך ריקה"}
          </h3>
          <p className="text-muted-foreground">
            {t("floorPlan.emptyState.description") ||
              "התחל ליצור את מפת המקום שלך על ידי הוספת שולחנות, אזורים או שימוש בתבנית מוכנה"}
          </p>
        </div>

        <div
          className={`flex gap-3 ${device.isMobile ? "flex-col" : "flex-row justify-center"}`}
        >
          {onUseTemplate && (
            <Button
              onClick={onUseTemplate}
              size="lg"
              className="gap-2 flex-1"
            >
              <Sparkles className="h-5 w-5" />
              {t("floorPlan.templates") || "התחל עם תבנית"}
            </Button>
          )}

          {onAddElement && (
            <Button
              onClick={onAddElement}
              variant="outline"
              size="lg"
              className="gap-2 flex-1"
            >
              <Plus className="h-5 w-5" />
              {t("floorPlan.addElement") || "הוסף אובייקט"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

