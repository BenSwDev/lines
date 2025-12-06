/**
 * Layout utility functions
 * Best practices for 2026: Type-safe, validated, immutable operations
 */

import type { VenueLayout, LayoutData } from "../types";

/**
 * Default layout data constants
 */
export const DEFAULT_LAYOUT_DATA: LayoutData = {
  width: 1600,
  height: 1200,
  scale: 1,
  gridSize: 20,
  showGrid: true,
  backgroundColor: "#f8f9fa"
} as const;

/**
 * Create a default empty layout
 */
export function createDefaultLayout(): VenueLayout {
  return {
    layoutData: { ...DEFAULT_LAYOUT_DATA },
    zones: [],
    tables: [],
    areas: []
  };
}

/**
 * Normalize layout data - ensures all required fields exist
 */
export function normalizeLayoutData(data: Partial<LayoutData> | null | undefined): LayoutData {
  if (!data) {
    return { ...DEFAULT_LAYOUT_DATA };
  }

  return {
    width: data.width ?? DEFAULT_LAYOUT_DATA.width,
    height: data.height ?? DEFAULT_LAYOUT_DATA.height,
    scale: data.scale ?? DEFAULT_LAYOUT_DATA.scale,
    gridSize: data.gridSize ?? DEFAULT_LAYOUT_DATA.gridSize,
    showGrid: data.showGrid ?? DEFAULT_LAYOUT_DATA.showGrid,
    backgroundColor: data.backgroundColor ?? DEFAULT_LAYOUT_DATA.backgroundColor
  };
}

/**
 * Normalize a complete layout - ensures all required fields exist
 */
export function normalizeLayout(layout: Partial<VenueLayout> | null | undefined): VenueLayout {
  if (!layout) {
    return createDefaultLayout();
  }

  return {
    layoutData: normalizeLayoutData(layout.layoutData),
    zones: layout.zones ?? [],
    tables: layout.tables ?? [],
    areas: layout.areas ?? []
  };
}

/**
 * Validate layout data
 */
export function validateLayoutData(data: unknown): data is LayoutData {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.width === "number" &&
    obj.width > 0 &&
    typeof obj.height === "number" &&
    obj.height > 0 &&
    typeof obj.scale === "number" &&
    obj.scale > 0
  );
}

/**
 * Validate complete layout
 */
export function validateLayout(layout: unknown): layout is VenueLayout {
  if (!layout || typeof layout !== "object") return false;

  const obj = layout as Record<string, unknown>;
  return (
    validateLayoutData(obj.layoutData) &&
    Array.isArray(obj.zones) &&
    Array.isArray(obj.tables) &&
    Array.isArray(obj.areas)
  );
}
