"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/core/i18n/provider";
import {
  FloorPlanEditorV2,
  type FloorPlanElement,
  type ElementShape
} from "@/modules/venue-settings/ui/FloorPlanEditorV2";
import { loadVenueTables } from "@/modules/venue-settings/actions/floorPlanActions";
import { useToast } from "@/hooks/use-toast";
import { translateError } from "@/utils/translateError";

type ZonesPageProps = {
  venueId: string;
  venueName: string;
};

export function ZonesPage({ venueId, venueName }: ZonesPageProps) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [venueCapacity] = useState(0);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await loadVenueTables(venueId);
      if (result.success && "data" in result) {
        // Convert tables to FloorPlanElements
        const tableElements: FloorPlanElement[] = (result.data || []).map((table) => ({
          id: table.id,
          type: "table" as const,
          name: table.name,
          seats: table.seats,
          notes: table.notes,
          x: table.x,
          y: table.y,
          width: table.width,
          height: table.height,
          rotation: table.rotation,
          shape: table.shape as ElementShape,
          zoneId: table.zoneId,
          color: table.color
        }));
        setElements(tableElements);
      } else {
        const errorMsg = !result.success && "error" in result ? result.error : null;
        toast({
          title: t("errors.generic"),
          description: errorMsg ? translateError(errorMsg, t) : t("errors.loadingVenues"),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: t("errors.generic"),
        description: error instanceof Error ? error.message : t("errors.unexpected"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("settings.venueMap") || t("settings.seating")} - {venueName}
          </h1>
          <p className="text-muted-foreground">{t("settings.seatingDescription")}</p>
        </div>
      </div>

      <FloorPlanEditorV2 venueId={venueId} initialElements={elements} initialCapacity={venueCapacity} />
    </div>
  );
}
