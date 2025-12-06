import type { FloorPlanElement, ElementType, SpecialAreaType } from "../ui/FloorPlanEditorV2";

export type VenueTemplateType = "event_hall" | "bar" | "club" | "restaurant" | "empty";

export interface VenueTemplate {
  id: string;
  name: string;
  description: string;
  elements: FloorPlanElement[];
  defaultCapacity: number;
}

// Event Hall Template - Large space with round tables
export const eventHallTemplate: VenueTemplate = {
  id: "event_hall",
  name: "אולם אירועים",
  description: "מבנה בסיסי לאולם אירועים עם שולחנות עגולים",
  defaultCapacity: 200,
  elements: [
    // Entrance
    {
      id: "entrance-1",
      type: "specialArea" as ElementType,
      name: "כניסה",
      x: 50,
      y: 50,
      width: 150,
      height: 80,
      rotation: 0,
      shape: "rectangle",
      areaType: "entrance" as SpecialAreaType,
      color: "#10B981"
    },
    // Main hall area
    {
      id: "zone-main",
      type: "zone" as ElementType,
      name: "אולם ראשי",
      x: 250,
      y: 50,
      width: 800,
      height: 600,
      rotation: 0,
      shape: "rectangle",
      color: "#3B82F6"
    },
    // Round tables (8 seats each)
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `table-${i + 1}`,
      type: "table" as ElementType,
      name: `שולחן ${i + 1}`,
      x: 300 + (i % 5) * 150,
      y: 100 + Math.floor(i / 5) * 120,
      width: 100,
      height: 100,
      rotation: 0,
      shape: "circle" as const,
      seats: 8,
      zoneId: "zone-main"
    })),
    // Stage
    {
      id: "stage-1",
      type: "specialArea" as ElementType,
      name: "במה",
      x: 250,
      y: 700,
      width: 800,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "stage" as SpecialAreaType,
      color: "#8B5CF6"
    },
    // Kitchen
    {
      id: "kitchen-1",
      type: "specialArea" as ElementType,
      name: "מטבח",
      x: 1100,
      y: 50,
      width: 200,
      height: 300,
      rotation: 0,
      shape: "rectangle",
      areaType: "kitchen" as SpecialAreaType,
      color: "#F59E0B"
    },
    // Restrooms
    {
      id: "restroom-1",
      type: "specialArea" as ElementType,
      name: "שירותים",
      x: 1100,
      y: 400,
      width: 200,
      height: 150,
      rotation: 0,
      shape: "rectangle",
      areaType: "restroom" as SpecialAreaType,
      color: "#06B6D4"
    }
  ]
};

// Bar Template - Bar counters and high tables
export const barTemplate: VenueTemplate = {
  id: "bar",
  name: "בר",
  description: "מבנה בסיסי לבר עם דלפקים ושולחנות גבוהים",
  defaultCapacity: 80,
  elements: [
    // Entrance
    {
      id: "entrance-1",
      type: "specialArea" as ElementType,
      name: "כניסה",
      x: 50,
      y: 300,
      width: 100,
      height: 80,
      rotation: 0,
      shape: "rectangle",
      areaType: "entrance" as SpecialAreaType,
      color: "#10B981"
    },
    // Main bar counter
    {
      id: "bar-counter-1",
      type: "table" as ElementType,
      name: "דלפק בר",
      x: 200,
      y: 200,
      width: 600,
      height: 80,
      rotation: 0,
      shape: "rectangle",
      tableType: "bar",
      seats: 20
    },
    // High tables
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `table-${i + 1}`,
      type: "table" as ElementType,
      name: `שולחן ${i + 1}`,
      x: 200 + (i % 4) * 150,
      y: 350 + Math.floor(i / 4) * 150,
      width: 60,
      height: 60,
      rotation: 0,
      shape: "circle" as const,
      tableType: "bar" as const,
      seats: 4
    })),
    // Storage
    {
      id: "storage-1",
      type: "specialArea" as ElementType,
      name: "מחסן",
      x: 900,
      y: 200,
      width: 150,
      height: 200,
      rotation: 0,
      shape: "rectangle",
      areaType: "storage" as SpecialAreaType,
      color: "#6B7280"
    }
  ]
};

// Club Template - Dance floor and VIP areas
export const clubTemplate: VenueTemplate = {
  id: "club",
  name: "מועדון",
  description: "מבנה בסיסי למועדון עם רחבת ריקודים ואזורי VIP",
  defaultCapacity: 300,
  elements: [
    // Entrance
    {
      id: "entrance-1",
      type: "specialArea" as ElementType,
      name: "כניסה",
      x: 50,
      y: 350,
      width: 100,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "entrance" as SpecialAreaType,
      color: "#10B981"
    },
    // Dance floor
    {
      id: "zone-dance",
      type: "zone" as ElementType,
      name: "רחבת ריקודים",
      x: 200,
      y: 200,
      width: 500,
      height: 500,
      rotation: 0,
      shape: "rectangle",
      color: "#EC4899"
    },
    // DJ Booth
    {
      id: "dj-booth-1",
      type: "specialArea" as ElementType,
      name: "תא DJ",
      x: 200,
      y: 100,
      width: 200,
      height: 80,
      rotation: 0,
      shape: "rectangle",
      areaType: "dj_booth" as SpecialAreaType,
      color: "#8B5CF6"
    },
    // VIP tables
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `table-vip-${i + 1}`,
      type: "table" as ElementType,
      name: `VIP ${i + 1}`,
      x: 750 + (i % 4) * 120,
      y: 250 + Math.floor(i / 4) * 150,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "square" as const,
      seats: 6
    })),
    // Bar
    {
      id: "bar-1",
      type: "specialArea" as ElementType,
      name: "בר",
      x: 750,
      y: 600,
      width: 300,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "bar" as SpecialAreaType,
      color: "#F59E0B"
    }
  ]
};

// Restaurant Template - Tables and booths
export const restaurantTemplate: VenueTemplate = {
  id: "restaurant",
  name: "מסעדה",
  description: "מבנה בסיסי למסעדה עם שולחנות וקיוסקים",
  defaultCapacity: 120,
  elements: [
    // Entrance
    {
      id: "entrance-1",
      type: "specialArea" as ElementType,
      name: "כניסה",
      x: 50,
      y: 350,
      width: 100,
      height: 80,
      rotation: 0,
      shape: "rectangle",
      areaType: "entrance" as SpecialAreaType,
      color: "#10B981"
    },
    // Dining area
    {
      id: "zone-dining",
      type: "zone" as ElementType,
      name: "אזור אוכל",
      x: 200,
      y: 100,
      width: 800,
      height: 600,
      rotation: 0,
      shape: "rectangle",
      color: "#3B82F6"
    },
    // Tables (2-4 seats)
    ...Array.from({ length: 24 }, (_, i) => ({
      id: `table-${i + 1}`,
      type: "table" as ElementType,
      name: `שולחן ${i + 1}`,
      x: 250 + (i % 6) * 120,
      y: 150 + Math.floor(i / 6) * 100,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: i % 3 === 0 ? 4 : 2,
      zoneId: "zone-dining"
    })),
    // Kitchen
    {
      id: "kitchen-1",
      type: "specialArea" as ElementType,
      name: "מטבח",
      x: 1050,
      y: 100,
      width: 200,
      height: 400,
      rotation: 0,
      shape: "rectangle",
      areaType: "kitchen" as SpecialAreaType,
      color: "#F59E0B"
    },
    // Restrooms
    {
      id: "restroom-1",
      type: "specialArea" as ElementType,
      name: "שירותים",
      x: 1050,
      y: 550,
      width: 200,
      height: 150,
      rotation: 0,
      shape: "rectangle",
      areaType: "restroom" as SpecialAreaType,
      color: "#06B6D4"
    }
  ]
};

// Empty template
export const emptyTemplate: VenueTemplate = {
  id: "empty",
  name: "ריק",
  description: "התחל מאפס",
  defaultCapacity: 0,
  elements: []
};

export const templates: Record<VenueTemplateType, VenueTemplate> = {
  event_hall: eventHallTemplate,
  bar: barTemplate,
  club: clubTemplate,
  restaurant: restaurantTemplate,
  empty: emptyTemplate
};

export function getTemplate(type: VenueTemplateType): VenueTemplate {
  return templates[type];
}

export function getAllTemplates(): VenueTemplate[] {
  return Object.values(templates);
}

