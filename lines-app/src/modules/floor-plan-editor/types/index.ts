// Floor Plan Editor Types
// Based on ANALYSIS_VENUE_SETTINGS_TRANSFORMATION.md

// ============================================================================
// FLOOR PLAN TYPES
// ============================================================================

export interface FloorPlan {
  id: string;
  venueId: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  zones?: Zone[];
  venueAreas?: VenueArea[];
  lines?: FloorPlanLine[];
}

export interface FloorPlanLine {
  floorPlanId: string;
  lineId: string;
  createdAt: Date;
  line?: {
    id: string;
    name: string;
    color: string;
  };
}

// ============================================================================
// ZONE & TABLE TYPES
// ============================================================================

export interface Zone {
  id: string;
  venueId: string;
  floorPlanId?: string | null;
  name: string;
  color: string;
  description?: string | null;
  positionX?: number | null;
  positionY?: number | null;
  width?: number | null;
  height?: number | null;
  shape?: string | null;
  polygonPoints?: unknown;
  zoneNumber?: number | null;
  staffingRules?: StaffingRule[] | null;
  zoneMinimumPrice?: number | null;
  createdAt: Date;
  updatedAt: Date;
  tables?: Table[];
}

export interface Table {
  id: string;
  zoneId: string;
  name: string;
  seats?: number | null;
  notes?: string | null;
  positionX?: number | null;
  positionY?: number | null;
  width?: number | null;
  height?: number | null;
  rotation?: number | null;
  shape?: string | null;
  tableType?: string | null;
  tableNumber?: number | null;
  minimumPrice?: number | null;
  staffingRules?: StaffingRule[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueArea {
  id: string;
  venueId: string;
  floorPlanId?: string | null;
  areaType: string;
  name: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation?: number | null;
  shape?: string | null;
  icon?: string | null;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// STAFFING TYPES
// ============================================================================

export interface StaffingRule {
  roleId: string;
  count: number;
  roleName?: string;
  roleColor?: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export type EditorMode = "view" | "content" | "staffing" | "minimum-order";

export type WizardStep = "shape" | "size" | "zones" | "tables" | "finish";

export interface EditorState {
  mode: EditorMode;
  selectedElementId: string | null;
  selectedElementType: "zone" | "table" | "area" | null;
  filters: {
    showZones: boolean;
    showTables: boolean;
    showBars: boolean;
    showAreas: boolean;
  };
  zoom: number;
  pan: { x: number; y: number };
}

export interface WizardState {
  step: WizardStep;
  venueShape: VenueShape;
  venueSize: VenueSize;
  zones: WizardZone[];
  floorPlanName: string;
  selectedLineIds: string[];
}

export type VenueShape = "rectangle" | "square" | "l-shape" | "custom";

export type VenueSize = "small" | "medium" | "large";

export interface WizardZone {
  id: string;
  type: "seating" | "bar" | "restroom" | "entrance" | "vip" | "stage" | "kitchen" | "dj-booth";
  name: string;
  color: string;
  tableCount: number;
  seatsPerTable: number;
  autoFill: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface CreateFloorPlanInput {
  venueId: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  zones?: CreateZoneInput[];
  venueAreas?: CreateVenueAreaInput[];
  lineIds?: string[];
}

export interface CreateZoneInput {
  name: string;
  color: string;
  description?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  shape?: string;
  zoneNumber?: number;
  tables?: CreateTableInput[];
}

export interface CreateTableInput {
  name: string;
  seats?: number;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  shape?: string;
  tableType?: string;
  tableNumber?: number;
}

export interface CreateVenueAreaInput {
  areaType: string;
  name: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  shape?: string;
  icon?: string;
  color?: string;
}

export interface UpdateZoneContentInput {
  id: string;
  name?: string;
  zoneNumber?: number;
  description?: string;
}

export interface UpdateTableContentInput {
  id: string;
  name?: string;
  tableNumber?: number;
  seats?: number;
}

export interface UpdateStaffingInput {
  targetType: "zone" | "table";
  targetId: string;
  staffingRules: StaffingRule[];
}

export interface UpdateMinimumOrderInput {
  targetType: "zone" | "table";
  targetId: string;
  minimumPrice: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface FloorPlanWithDetails extends FloorPlan {
  zones: (Zone & { tables: Table[] })[];
  venueAreas: VenueArea[];
  lines: FloorPlanLine[];
  _count?: {
    zones: number;
    venueAreas: number;
  };
}

export interface FloorPlanListItem {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    zones: number;
    venueAreas: number;
  };
  lines: {
    line: {
      id: string;
      name: string;
      color: string;
    };
  }[];
}

// ============================================================================
// ZONE TYPE CONFIGURATIONS
// ============================================================================

export const ZONE_TYPE_CONFIGS = {
  seating: {
    label: "אזור ישיבה",
    labelEn: "Seating Area",
    icon: "🪑",
    defaultColor: "#3B82F6"
  },
  bar: {
    label: "בר",
    labelEn: "Bar",
    icon: "🍸",
    defaultColor: "#F59E0B"
  },
  restroom: {
    label: "שירותים",
    labelEn: "Restroom",
    icon: "🚻",
    defaultColor: "#6B7280"
  },
  entrance: {
    label: "כניסה",
    labelEn: "Entrance",
    icon: "🚪",
    defaultColor: "#10B981"
  },
  vip: {
    label: "VIP",
    labelEn: "VIP",
    icon: "⭐",
    defaultColor: "#8B5CF6"
  },
  stage: {
    label: "במה",
    labelEn: "Stage",
    icon: "🎤",
    defaultColor: "#EC4899"
  },
  kitchen: {
    label: "מטבח",
    labelEn: "Kitchen",
    icon: "👨‍🍳",
    defaultColor: "#EF4444"
  },
  "dj-booth": {
    label: "DJ",
    labelEn: "DJ Booth",
    icon: "🎧",
    defaultColor: "#6366F1"
  }
} as const;

export type ZoneTypeKey = keyof typeof ZONE_TYPE_CONFIGS;
