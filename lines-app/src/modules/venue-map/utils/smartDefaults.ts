/**
 * Smart Defaults Utility
 * Provides intelligent default values for floor plan elements
 * "גאוני כמה שזה פשוט" - ערכים חכמים כברירת מחדל
 */

import type { FloorPlanElement, ElementType, SpecialAreaType } from "../ui/FloorPlanEditorV2";
import { GRID_SIZE } from "../ui/FloorPlanEditorV2";

export interface SmartDefaults {
  table: {
    seats: number;
    size: number;
    color: string;
  };
  zone: {
    type: "tables_zone";
    size: number;
    color: string;
  };
  area: {
    type: SpecialAreaType;
    size: number;
    color: string;
  };
}

export const SMART_DEFAULTS: SmartDefaults = {
  table: {
    seats: 4,
    size: 80, // Snapped to GRID_SIZE
    color: "#3B82F6" // Blue
  },
  zone: {
    type: "tables_zone",
    size: 200, // Snapped to GRID_SIZE
    color: "#10B981" // Green
  },
  area: {
    type: "kitchen",
    size: 100, // Snapped to GRID_SIZE
    color: "#F59E0B" // Yellow
  }
};

/**
 * Get next auto-generated name for an element
 */
export function getNextElementName(
  elementType: ElementType,
  existingElements: FloorPlanElement[],
  customPrefix?: string
): string {
  const prefix = customPrefix || getDefaultPrefix(elementType);
  const sameTypeElements = existingElements.filter((e) => e.type === elementType);
  const nextNumber = sameTypeElements.length + 1;
  return `${prefix} ${nextNumber}`;
}

/**
 * Get default prefix for element type
 */
function getDefaultPrefix(elementType: ElementType): string {
  switch (elementType) {
    case "table":
      return "שולחן";
    case "zone":
      return "אזור";
    case "specialArea":
      return "אזור מיוחד";
    case "security":
      return "אבטחה";
    case "line":
      return "קו";
    default:
      return "אובייקט";
  }
}

/**
 * Snap size to grid
 */
export function snapToGrid(size: number): number {
  return Math.round(size / GRID_SIZE) * GRID_SIZE;
}

/**
 * Get smart default for table
 */
export function getTableDefaults(existingElements: FloorPlanElement[]): {
  name: string;
  seats: number;
  size: number;
  color: string;
} {
  return {
    name: getNextElementName("table", existingElements),
    seats: SMART_DEFAULTS.table.seats,
    size: snapToGrid(SMART_DEFAULTS.table.size),
    color: SMART_DEFAULTS.table.color
  };
}

/**
 * Get smart default for zone
 */
export function getZoneDefaults(existingElements: FloorPlanElement[]): {
  name: string;
  type: "tables_zone";
  size: number;
  color: string;
} {
  return {
    name: getNextElementName("zone", existingElements),
    type: SMART_DEFAULTS.zone.type,
    size: snapToGrid(SMART_DEFAULTS.zone.size),
    color: SMART_DEFAULTS.zone.color
  };
}

/**
 * Get smart default for area
 */
export function getAreaDefaults(existingElements: FloorPlanElement[]): {
  name: string;
  type: SpecialAreaType;
  size: number;
  color: string;
} {
  return {
    name: getNextElementName("specialArea", existingElements),
    type: SMART_DEFAULTS.area.type,
    size: snapToGrid(SMART_DEFAULTS.area.size),
    color: SMART_DEFAULTS.area.color
  };
}
