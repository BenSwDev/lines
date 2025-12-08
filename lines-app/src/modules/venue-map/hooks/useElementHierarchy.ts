/**
 * Hook for managing element hierarchy
 * Organizes elements into tree structure (zones with children)
 */

import { useMemo } from "react";
import type { FloorPlanElement, ElementHierarchy } from "../types";

export function useElementHierarchy(elements: FloorPlanElement[]) {
  const hierarchy = useMemo(() => {
    const zones = elements.filter((e) => e.type === "zone");
    const tables = elements.filter((e) => e.type === "table");
    const bars = elements.filter((e) => e.type === "table" && e.tableType === "bar");
    const otherElements = elements.filter(
      (e) => e.type !== "zone" && e.type !== "table"
    );

    // Build hierarchy: zones with their children
    const zoneHierarchy: ElementHierarchy[] = zones.map((zone) => ({
      zone,
      children: [
        ...tables.filter((t) => t.zoneId === zone.id),
        ...bars.filter((b) => b.zoneId === zone.id),
        ...otherElements.filter((e) => e.zoneId === zone.id)
      ]
    }));

    // Elements not in any zone
    const unassignedElements = [
      ...tables.filter((t) => !t.zoneId),
      ...bars.filter((b) => !b.zoneId),
      ...otherElements.filter((e) => !e.zoneId)
    ];

    return {
      zones,
      tables,
      bars,
      zoneHierarchy,
      unassignedElements,
      totalElements: elements.length
    };
  }, [elements]);

  return hierarchy;
}

