/**
 * Types for visual seating layout system
 */

export type ShapeType = "rectangle" | "circle" | "oval" | "square" | "polygon";

export type TableType = "table" | "bar" | "counter";

export type AreaType =
  | "entrance"
  | "exit"
  | "kitchen"
  | "restroom"
  | "dj_booth"
  | "stage"
  | "storage"
  | "bar"
  | "counter"
  | "vip"
  | "dance_floor"
  | "outdoor"
  | "other";

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface VisualElement {
  id: string;
  position: Position;
  dimensions: Dimensions;
  rotation?: number;
  shape: ShapeType;
}

export interface ZoneVisual extends VisualElement {
  name: string;
  color: string;
  description?: string;
  polygonPoints?: Position[];
}

export interface TableVisual extends VisualElement {
  name: string;
  seats?: number;
  notes?: string;
  tableType: TableType;
  zoneId: string;
}

export interface VenueAreaVisual extends VisualElement {
  name: string;
  areaType: AreaType;
  icon?: string;
  color?: string;
}

export interface LayoutData {
  width: number; // Canvas width in pixels
  height: number; // Canvas height in pixels
  scale: number; // Scale factor (e.g., 1 pixel = 0.1 meters)
  gridSize?: number; // Grid size for snapping
  showGrid?: boolean;
  backgroundColor?: string;
}

export interface VenueLayout {
  layoutData: LayoutData;
  zones: ZoneVisual[];
  tables: TableVisual[];
  areas: VenueAreaVisual[];
}
