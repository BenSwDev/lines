"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/core/i18n/provider";
import { FloorPlanEditor } from "./FloorPlanEditor";
import type { FloorPlanElement, ElementShape, SpecialAreaType } from "../types";
import { loadVenueFloorPlan } from "../actions/floorPlanActions";
import { useToast } from "@/hooks/use-toast";
import { translateError } from "@/utils/translateError";
import { findContainingZone } from "../utils/zoneContainment";
import { LoadingState } from "./UX/LoadingState";
import { ErrorBoundary } from "./UX/ErrorBoundary";

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

  const loadData = async () => {
    try {
      setIsLoading(true);
      // CRITICAL: Pass userId for ownership validation
      const result = await loadVenueFloorPlan(venueId, userId);
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
          color: table.color,
          tableNumber: table.tableNumber || null,
          minimumPrice: table.minimumPrice || null
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
          polygonPoints: zone.polygonPoints,
          zoneMinimumPrice: zone.zoneMinimumPrice || null
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

        // Auto-link elements to zones after loading
        const zones = allElements.filter((el) => el.type === "zone");
        const linkedElements = allElements.map((element) => {
          // Only link tables and other elements that can be in zones (not zones themselves)
          if (element.type === "zone" || element.type === "specialArea") {
            return element; // Don't link zones or special areas
          }

          // Always find the current containing zone (even if already linked to another)
          // This ensures that if an element is moved from zone A to zone B, it gets updated to zone B
          const containingZone = findContainingZone(element, zones);

          if (containingZone) {
            // Element is in a zone - link to it (even if it was linked to a different zone before)
            return {
              ...element,
              zoneId: containingZone.id
            };
          }

          // No containing zone found - remove zoneId if it exists
          if (element.zoneId) {
            return {
              ...element,
              zoneId: undefined
            };
          }

          return element;
        });

        setElements(linkedElements);
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
    return <LoadingState type="full" />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("settings.venueMap") || "מפת המקום"} - {venueName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("settings.seatingDescription") || "מפה מלאה של המקום עם כל האלמנטים"}
          </p>
        </div>
      </div>

      <ErrorBoundary>
        <div className="flex-1 overflow-hidden">
          <FloorPlanEditor
            venueId={venueId}
            initialElements={elements}
            userId={userId}
          />
        </div>
      </ErrorBoundary>
    </div>
  );
}
