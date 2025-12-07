"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/core/i18n/provider";
import {
  FloorPlanEditorV2,
  type FloorPlanElement,
  type ElementShape,
  type SpecialAreaType
} from "./FloorPlanEditorV2";
import { loadVenueFloorPlan } from "../actions/floorPlanActions";
import { useToast } from "@/hooks/use-toast";
import { translateError } from "@/utils/translateError";

type VenueMapPageProps = {
  venueId: string;
  venueName: string;
  userId: string;
};

export function VenueMapPage({ venueId, venueName, userId }: VenueMapPageProps) {
  const { t } = useTranslations();
  const { toast } = useToast();
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [venueCapacity] = useState(0);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await loadVenueFloorPlan(venueId);
      if (result.success && "data" in result && result.data) {
        const allElements: FloorPlanElement[] = [];

        // Convert tables to FloorPlanElements
        const tableElements: FloorPlanElement[] = (result.data.tables || []).map((table) => ({
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

        // Convert zones to FloorPlanElements
        const zoneElements: FloorPlanElement[] = (result.data.zones || []).map((zone) => ({
          id: zone.id,
          type: "zone" as const,
          name: zone.name,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          rotation: 0,
          shape: zone.shape as ElementShape,
          color: zone.color,
          description: zone.description,
          polygonPoints: zone.polygonPoints
        }));

        // Convert venue areas to FloorPlanElements
        const areaElements: FloorPlanElement[] = (result.data.venueAreas || []).map((area) => ({
          id: area.id,
          type: "specialArea" as const,
          name: area.name,
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
          rotation: area.rotation,
          shape: area.shape as ElementShape,
          areaType: area.areaType as SpecialAreaType,
          color: area.color,
          icon: area.icon
        }));

        allElements.push(...zoneElements, ...tableElements, ...areaElements);
        setElements(allElements);
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
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {t("settings.venueMap") || "מפת המקום"} - {venueName}
              </h1>
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                BETA
              </span>
            </div>
            <p className="text-muted-foreground">
              {t("settings.seatingDescription") || "מפה מלאה של המקום עם כל האלמנטים"}
            </p>
          </div>
        </div>
      </div>

      <FloorPlanEditorV2
        venueId={venueId}
        initialElements={elements}
        initialCapacity={venueCapacity}
        userId={userId}
      />
    </div>
  );
}
