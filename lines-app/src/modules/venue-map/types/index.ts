/**
 * Shared Types for Venue Map Module
 * All types used across the module
 */

export type ElementShape = "rectangle" | "circle" | "triangle" | "square" | "polygon";

export type ElementType = "table" | "zone" | "specialArea" | "security" | "line";

export type SpecialAreaType =
  | "entrance"
  | "exit"
  | "kitchen"
  | "restroom"
  | "bar"
  | "stage"
  | "storage"
  | "dj_booth"
  | "other";

export interface Point {
  x: number;
  y: number;
}

export interface FloorPlanElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  shape: ElementShape;
  color?: string;
  // Table specific
  seats?: number | null;
  notes?: string | null;
  zoneId?: string;
  tableType?: "table" | "bar" | "counter";
  showStools?: boolean;
  minimumPrice?: number | null;
  pricePerSeat?: number | null;
  tableNumber?: number | null; // מספר שולחן
  // Zone specific
  description?: string | null;
  zoneType?:
    | "tables_zone"
    | "entrance_zone"
    | "dance_floor"
    | "vip_zone"
    | "bar_area"
    | "seating_area"
    | "standing_area"
    | "custom";
  zoneMinimumPrice?: number | null;
  // Special area specific
  areaType?: SpecialAreaType;
  icon?: string;
  // Polygon specific
  polygonPoints?: Point[];
}

export interface ViewState {
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  showTables: boolean;
  showZones: boolean;
  showBars: boolean;
  viewMode: "minimal" | "detailed";
}

export interface ElementHierarchy {
  zone: FloorPlanElement;
  children: FloorPlanElement[];
}

export const GRID_SIZE = 20;
export const DEFAULT_TABLE_SIZE = 80;
export const DEFAULT_ZONE_SIZE = 200;
export const DEFAULT_AREA_SIZE = 100;

