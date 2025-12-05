/**
 * Global constants for the Lines app
 */

export const APP_NAME = "Lines";

// Business rules
export const MAX_COLORS_PER_VENUE = 15;

// Color palette (15 unique colors for Lines)
export const LINE_COLOR_PALETTE = [
  "#FF6B6B", // Red
  "#4ECDC4", // Turquoise
  "#45B7D1", // Blue
  "#96CEB4", // Sage
  "#FFEAA7", // Yellow
  "#DFE6E9", // Light Gray
  "#74B9FF", // Sky Blue
  "#A29BFE", // Purple
  "#FD79A8", // Pink
  "#FDCB6E", // Orange
  "#6C5CE7", // Indigo
  "#00B894", // Green
  "#E17055", // Coral
  "#B2BEC3", // Gray
  "#55EFC4", // Mint
] as const;

// Time format constants
export const TIME_FORMAT = "HH:mm";
export const DATE_FORMAT = "YYYY-MM-DD";

// Default date suggestion horizon (in months)
export const DEFAULT_SUGGESTION_MONTHS = 6;

// Weekday indices (Hebrew)
export const WEEKDAY_NAMES_HE = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
] as const;

// Frequency types (Hebrew labels)
export const FREQUENCY_LABELS_HE = {
  weekly: "שבועי",
  monthly: "חודשי",
  variable: "משתנה",
  oneTime: "חד-פעמי",
} as const;

// Event status labels (Hebrew)
export const EVENT_STATUS_LABELS_HE = {
  cancelled: "בוטל",
  ended: "הסתיים",
  current: "מתקיים כעת",
  upcoming: "עתידי",
} as const;

