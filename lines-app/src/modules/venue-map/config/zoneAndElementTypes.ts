/**
 * Zone and Element Types Configuration
 * Defines all available zone types and element types with their properties
 */

// DoorOpen is used in ZONE_TYPES and ELEMENT_TYPES arrays (lines 53, 142, 152)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  MapPin,
  Square,
  Shield,
  Utensils,
  Bath,
  Music,
  Sparkles,
  Users,
  Home,
  DoorOpen
} from "lucide-react"; // eslint-disable-line @typescript-eslint/no-unused-vars

export type ZoneType =
  | "tables_zone" // אזור שולחנות
  | "entrance_zone" // אזור כניסה
  | "dance_floor" // רחבת ריקודים
  | "vip_zone" // אזור VIP
  | "bar_area" // אזור בר
  | "seating_area" // אזור ישיבה
  | "standing_area" // אזור עמידה
  | "custom"; // התאמה אישית

export type ElementCategory =
  | "table"
  | "bar"
  | "security"
  | "entrance"
  | "exit"
  | "kitchen"
  | "restroom"
  | "dj"
  | "stage"
  | "storage"
  | "custom";

export interface ZoneTypeConfig {
  id: ZoneType;
  label: string;
  icon: typeof MapPin;
  color: string;
  description: string;
  defaultColor: string;
}

export interface ElementTypeConfig {
  id: ElementCategory;
  label: string;
  icon: typeof Square;
  color: string;
  description: string;
  canBeInZone: boolean; // Can this element be contained in a zone?
  defaultSize: { width: number; height: number };
  defaultColor?: string;
}

export const ZONE_TYPES: ZoneTypeConfig[] = [
  {
    id: "tables_zone",
    label: "אזור שולחנות",
    icon: Square,
    color: "#3B82F6",
    description: "אזור להכלת שולחנות",
    defaultColor: "#3B82F6"
  },
  {
    id: "entrance_zone",
    label: "אזור כניסה",
    icon: DoorOpen,
    color: "#10B981",
    description: "אזור כניסה למקום",
    defaultColor: "#10B981"
  },
  {
    id: "dance_floor",
    label: "רחבת ריקודים",
    icon: Music,
    color: "#8B5CF6",
    description: "רחבת ריקודים",
    defaultColor: "#8B5CF6"
  },
  {
    id: "vip_zone",
    label: "אזור VIP",
    icon: Sparkles,
    color: "#F59E0B",
    description: "אזור VIP בלעדי",
    defaultColor: "#F59E0B"
  },
  {
    id: "bar_area",
    label: "אזור בר",
    icon: Utensils,
    color: "#EF4444",
    description: "אזור בר ושירותי שתייה",
    defaultColor: "#EF4444"
  },
  {
    id: "seating_area",
    label: "אזור ישיבה",
    icon: Users,
    color: "#06B6D4",
    description: "אזור ישיבה כללי",
    defaultColor: "#06B6D4"
  },
  {
    id: "standing_area",
    label: "אזור עמידה",
    icon: Home,
    color: "#84CC16",
    description: "אזור עמידה",
    defaultColor: "#84CC16"
  },
  {
    id: "custom",
    label: "התאמה אישית",
    icon: MapPin,
    color: "#6B7280",
    description: "אזור מותאם אישית",
    defaultColor: "#6B7280"
  }
];

export const ELEMENT_TYPES: ElementTypeConfig[] = [
  {
    id: "table",
    label: "שולחן",
    icon: Square,
    color: "#3B82F6",
    description: "שולחן רגיל",
    canBeInZone: true,
    defaultSize: { width: 80, height: 80 },
    defaultColor: "#3B82F6"
  },
  {
    id: "bar",
    label: "בר",
    icon: Utensils,
    color: "#EF4444",
    description: "בר או דלפק",
    canBeInZone: true,
    defaultSize: { width: 120, height: 60 },
    defaultColor: "#EF4444"
  },
  {
    id: "security",
    label: "מיקום אבטחה",
    icon: Shield,
    color: "#F59E0B",
    description: "מיקום אבטחה",
    canBeInZone: true,
    defaultSize: { width: 60, height: 60 },
    defaultColor: "#F59E0B"
  },
  {
    id: "entrance",
    label: "כניסה",
    icon: DoorOpen,
    color: "#10B981",
    description: "נקודת כניסה",
    canBeInZone: false,
    defaultSize: { width: 100, height: 100 },
    defaultColor: "#10B981"
  },
  {
    id: "exit",
    label: "יציאה",
    icon: DoorOpen,
    color: "#EF4444",
    description: "נקודת יציאה",
    canBeInZone: false,
    defaultSize: { width: 100, height: 100 },
    defaultColor: "#EF4444"
  },
  {
    id: "kitchen",
    label: "מטבח",
    icon: Utensils,
    color: "#F59E0B",
    description: "אזור מטבח",
    canBeInZone: false,
    defaultSize: { width: 150, height: 150 },
    defaultColor: "#F59E0B"
  },
  {
    id: "restroom",
    label: "שירותים",
    icon: Bath,
    color: "#06B6D4",
    description: "שירותים",
    canBeInZone: false,
    defaultSize: { width: 100, height: 100 },
    defaultColor: "#06B6D4"
  },
  {
    id: "dj",
    label: "דיג'יי",
    icon: Music,
    color: "#8B5CF6",
    description: "תחנת דיג'יי",
    canBeInZone: false,
    defaultSize: { width: 120, height: 80 },
    defaultColor: "#8B5CF6"
  },
  {
    id: "stage",
    label: "במה",
    icon: Sparkles,
    color: "#F59E0B",
    description: "במה או במה קטנה",
    canBeInZone: false,
    defaultSize: { width: 200, height: 150 },
    defaultColor: "#F59E0B"
  },
  {
    id: "storage",
    label: "מחסן",
    icon: Home,
    color: "#6B7280",
    description: "מחסן או אחסון",
    canBeInZone: false,
    defaultSize: { width: 100, height: 100 },
    defaultColor: "#6B7280"
  },
  {
    id: "custom",
    label: "התאמה אישית",
    icon: Square,
    color: "#6B7280",
    description: "אלמנט מותאם אישית",
    canBeInZone: true,
    defaultSize: { width: 80, height: 80 },
    defaultColor: "#6B7280"
  }
];

export function getZoneTypeConfig(type: ZoneType): ZoneTypeConfig {
  return ZONE_TYPES.find((z) => z.id === type) || ZONE_TYPES[ZONE_TYPES.length - 1];
}

export function getElementTypeConfig(type: ElementCategory): ElementTypeConfig {
  return ELEMENT_TYPES.find((e) => e.id === type) || ELEMENT_TYPES[ELEMENT_TYPES.length - 1];
}
