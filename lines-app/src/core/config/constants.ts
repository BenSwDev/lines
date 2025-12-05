// Lines App - Core Constants
// Per information/lines-mvp-information-v1.md

export const APP_NAME = "Lines" as const;
export const APP_TAGLINE = "Venue Event Management" as const;

// Color palette for Lines (15 unique colors per venue)
// Excludes red, white, black, and primary branding colors
export const COLOR_PALETTE_SIZE = 15;

export const COLOR_PALETTE: string[] = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Green
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#A855F7", // Violet
  "#84CC16", // Lime
  "#F43F5E", // Rose
  "#0EA5E9", // Sky
  "#22C55E", // Emerald
  "#EAB308" // Yellow
];

// Time format constants
export const TIME_FORMAT = "HH:mm";
export const DATE_FORMAT = "YYYY-MM-DD";

// Default date suggestion horizon (in months)
export const DEFAULT_SUGGESTION_MONTHS = 6;

// Weekday indices (Hebrew)
export const WEEKDAY_NAMES_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"] as const;

// Frequency types (Hebrew labels)
export const FREQUENCY_LABELS_HE = {
  weekly: "שבועי",
  monthly: "חודשי",
  variable: "משתנה",
  oneTime: "חד-פעמי"
} as const;

// Event status labels (Hebrew)
export const EVENT_STATUS_LABELS_HE = {
  cancelled: "בוטל",
  ended: "הסתיים",
  current: "מתקיים כעת",
  upcoming: "עתידי"
} as const;
