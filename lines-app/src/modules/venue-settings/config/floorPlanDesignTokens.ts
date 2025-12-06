/**
 * Design Tokens for Floor Plan Editor
 * Defines consistent colors, typography, and spacing for all floor plan elements
 */

// Area Type Colors - Consistent across the system
export const AREA_TYPE_COLORS: Record<string, string> = {
  // Special Areas
  entrance: "#10B981", // Green
  exit: "#EF4444", // Red
  kitchen: "#F59E0B", // Amber/Orange
  restroom: "#06B6D4", // Cyan
  bar: "#8B5CF6", // Purple
  stage: "#EC4899", // Pink
  storage: "#6B7280", // Gray
  dj_booth: "#6366F1", // Indigo
  other: "#94A3B8", // Slate
  
  // Zones
  zone: "#3B82F6", // Blue (default)
  
  // Tables
  table: "#FFFFFF", // White (neutral, standard)
  table_bar: "#F3F4F6", // Light gray
  table_counter: "#F9FAFB", // Very light gray
};

// Typography
export const FLOOR_PLAN_TYPOGRAPHY = {
  tableNumber: {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1.2",
    color: "#1F2937" // Gray-800
  },
  tableSeats: {
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "1.2",
    color: "#6B7280" // Gray-500
  },
  zoneName: {
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1.2",
    color: "#374151" // Gray-700
  },
  areaName: {
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1.2",
    color: "#1F2937" // Gray-800
  }
};

// Spacing
export const FLOOR_PLAN_SPACING = {
  panelWidth: {
    collapsed: "48px",
    expanded: "280px"
  },
  toolbarHeight: "56px",
  canvasPadding: "16px"
};

// Shadows
export const FLOOR_PLAN_SHADOWS = {
  element: "0 2px 4px rgba(0, 0, 0, 0.1)",
  elementSelected: "0 4px 8px rgba(59, 130, 246, 0.3)",
  panel: "2px 0 8px rgba(0, 0, 0, 0.1)",
  toolbar: "0 2px 4px rgba(0, 0, 0, 0.05)"
};

// Border Radius
export const FLOOR_PLAN_RADIUS = {
  element: "4px",
  panel: "8px",
  button: "6px"
};


