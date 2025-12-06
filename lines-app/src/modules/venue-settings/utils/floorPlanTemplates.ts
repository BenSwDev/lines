import type { FloorPlanElement, ElementType, SpecialAreaType } from "../ui/FloorPlanEditorV2";

export type VenueTemplateType = "event_hall" | "bar" | "club" | "restaurant" | "conference_hall" | "concert_hall" | "empty";

export interface VenueTemplate {
  id: string;
  name: string;
  description: string;
  elements: FloorPlanElement[];
  defaultCapacity: number;
}

// Default canvas size
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Helper function to scale coordinates to fit canvas
function scaleToCanvas(elements: FloorPlanElement[], targetWidth: number, targetHeight: number): FloorPlanElement[] {
  if (elements.length === 0) return elements;
  
  // Find bounds of all elements
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  elements.forEach(el => {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  });
  
  const sourceWidth = maxX - minX;
  const sourceHeight = maxY - minY;
  
  // Calculate scale factor (with padding)
  const padding = 40;
  const scaleX = (targetWidth - padding * 2) / sourceWidth;
  const scaleY = (targetHeight - padding * 2) / sourceHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // Scale all elements and center on infinite canvas (2500x2500 center)
  const centerX = 2500;
  const centerY = 2500;
  
  return elements.map(el => ({
    ...el,
    x: centerX + (el.x - minX - sourceWidth / 2) * scale,
    y: centerY + (el.y - minY - sourceHeight / 2) * scale,
    width: el.width * scale,
    height: el.height * scale
  }));
}

// Event Hall Template - Large space with round tables
const eventHallTemplateRaw: VenueTemplate = {
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
    // Round tables (8 seats each) - reduced to 12 tables
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `table-${i + 1}`,
      type: "table" as ElementType,
      name: `שולחן ${i + 1}`,
      x: 300 + (i % 4) * 180,
      y: 100 + Math.floor(i / 4) * 150,
      width: 100,
      height: 100,
      rotation: 0,
      shape: "circle" as const,
      seats: 8,
      zoneId: "zone-main"
    })),
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
const barTemplateRaw: VenueTemplate = {
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
    // High tables - reduced to 8 tables
    ...Array.from({ length: 8 }, (_, i) => ({
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
    // Restrooms
    {
      id: "restroom-1",
      type: "specialArea" as ElementType,
      name: "שירותים",
      x: 900,
      y: 200,
      width: 150,
      height: 200,
      rotation: 0,
      shape: "rectangle",
      areaType: "restroom" as SpecialAreaType,
      color: "#06B6D4"
    }
  ]
};

// Club Template - Dance floor and VIP areas
const clubTemplateRaw: VenueTemplate = {
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
    // VIP tables - reduced to 6 tables
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `table-vip-${i + 1}`,
      type: "table" as ElementType,
      name: `VIP ${i + 1}`,
      x: 750 + (i % 3) * 120,
      y: 250 + Math.floor(i / 3) * 150,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 6
    })),
    // Bar counter
    {
      id: "bar-counter-1",
      type: "table" as ElementType,
      name: "דלפק בר",
      x: 750,
      y: 600,
      width: 300,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      tableType: "bar",
      seats: 20
    },
    // Restrooms
    {
      id: "restroom-1",
      type: "specialArea" as ElementType,
      name: "שירותים",
      x: 1100,
      y: 600,
      width: 150,
      height: 150,
      rotation: 0,
      shape: "rectangle",
      areaType: "restroom" as SpecialAreaType,
      color: "#06B6D4"
    }
  ]
};

// Restaurant Template - Tables and booths
const restaurantTemplateRaw: VenueTemplate = {
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
    // Tables (2-4 seats) - reduced to 15 tables
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `table-${i + 1}`,
      type: "table" as ElementType,
      name: `שולחן ${i + 1}`,
      x: 250 + (i % 5) * 120,
      y: 150 + Math.floor(i / 5) * 100,
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

// Scale all templates to fit default canvas size
export const eventHallTemplate: VenueTemplate = {
  ...eventHallTemplateRaw,
  elements: scaleToCanvas(eventHallTemplateRaw.elements, CANVAS_WIDTH, CANVAS_HEIGHT)
};

export const barTemplate: VenueTemplate = {
  ...barTemplateRaw,
  elements: scaleToCanvas(barTemplateRaw.elements, CANVAS_WIDTH, CANVAS_HEIGHT)
};

export const clubTemplate: VenueTemplate = {
  ...clubTemplateRaw,
  elements: scaleToCanvas(clubTemplateRaw.elements, CANVAS_WIDTH, CANVAS_HEIGHT)
};

export const restaurantTemplate: VenueTemplate = {
  ...restaurantTemplateRaw,
  elements: scaleToCanvas(restaurantTemplateRaw.elements, CANVAS_WIDTH, CANVAS_HEIGHT)
};

// Conference Hall Template - Rows of seats facing a stage
const conferenceHallTemplateRaw: VenueTemplate = {
  id: "conference_hall",
  name: "אולם כנסים",
  description: "מבנה בסיסי לאולם כנסים עם שורות מושבים ובמה",
  defaultCapacity: 300,
  elements: [
    // Entrance
    {
      id: "entrance-1",
      type: "specialArea" as ElementType,
      name: "כניסה",
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "entrance" as SpecialAreaType,
      color: "#10B981"
    },
    // Main hall area
    {
      id: "zone-main",
      type: "zone" as ElementType,
      name: "אולם כנסים",
      x: 300,
      y: 50,
      width: 1000,
      height: 700,
      rotation: 0,
      shape: "rectangle",
      color: "#3B82F6"
    },
    // Rows of seats (rectangular tables representing rows)
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `row-${i + 1}`,
      type: "table" as ElementType,
      name: `שורה ${i + 1}`,
      x: 350 + (i % 5) * 180,
      y: 100 + Math.floor(i / 5) * 120,
      width: 150,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 20,
      zoneId: "zone-main"
    })),
    // Exit
    {
      id: "exit-1",
      type: "specialArea" as ElementType,
      name: "יציאה",
      x: 1350,
      y: 50,
      width: 200,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "exit" as SpecialAreaType,
      color: "#EF4444"
    },
    // Restrooms
    {
      id: "restroom-1",
      type: "specialArea" as ElementType,
      name: "שירותים",
      x: 1350,
      y: 200,
      width: 200,
      height: 200,
      rotation: 0,
      shape: "rectangle",
      areaType: "restroom" as SpecialAreaType,
      color: "#06B6D4"
    }
  ]
};

// Concert Hall Template - Stage with standing area and VIP sections
const concertHallTemplateRaw: VenueTemplate = {
  id: "concert_hall",
  name: "אולם הופעות",
  description: "מבנה בסיסי לאולם הופעות עם אזור עמידה, במה ואזורי VIP",
  defaultCapacity: 500,
  elements: [
    // Entrance
    {
      id: "entrance-1",
      type: "specialArea" as ElementType,
      name: "כניסה",
      x: 50,
      y: 300,
      width: 150,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "entrance" as SpecialAreaType,
      color: "#10B981"
    },
    // Main standing area
    {
      id: "zone-standing",
      type: "zone" as ElementType,
      name: "אזור עמידה",
      x: 250,
      y: 200,
      width: 800,
      height: 600,
      rotation: 0,
      shape: "rectangle",
      color: "#EC4899"
    },
    // VIP area 1
    {
      id: "zone-vip-1",
      type: "zone" as ElementType,
      name: "VIP 1",
      x: 1100,
      y: 200,
      width: 300,
      height: 250,
      rotation: 0,
      shape: "rectangle",
      color: "#F59E0B"
    },
    // VIP area 2
    {
      id: "zone-vip-2",
      type: "zone" as ElementType,
      name: "VIP 2",
      x: 1100,
      y: 500,
      width: 300,
      height: 250,
      rotation: 0,
      shape: "rectangle",
      color: "#F59E0B"
    },
    // VIP tables
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `table-vip-${i + 1}`,
      type: "table" as ElementType,
      name: `VIP ${i + 1}`,
      x: 1150 + (i % 4) * 60,
      y: 250 + Math.floor(i / 4) * 550,
      width: 50,
      height: 50,
      rotation: 0,
      shape: "circle" as const,
      seats: 4,
      zoneId: i < 4 ? "zone-vip-1" : "zone-vip-2"
    })),
    // Bar counter
    {
      id: "bar-counter-1",
      type: "table" as ElementType,
      name: "דלפק בר",
      x: 1100,
      y: 800,
      width: 300,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      tableType: "bar",
      seats: 20
    },
    // Exit
    {
      id: "exit-1",
      type: "specialArea" as ElementType,
      name: "יציאה",
      x: 1450,
      y: 300,
      width: 150,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "exit" as SpecialAreaType,
      color: "#EF4444"
    }
  ]
};

// Scale all templates to fit default canvas size
export const conferenceHallTemplate: VenueTemplate = {
  ...conferenceHallTemplateRaw,
  elements: scaleToCanvas(conferenceHallTemplateRaw.elements, CANVAS_WIDTH, CANVAS_HEIGHT)
};

export const concertHallTemplate: VenueTemplate = {
  ...concertHallTemplateRaw,
  elements: scaleToCanvas(concertHallTemplateRaw.elements, CANVAS_WIDTH, CANVAS_HEIGHT)
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
  conference_hall: conferenceHallTemplate,
  concert_hall: concertHallTemplate,
  empty: emptyTemplate
};

export function getTemplate(type: VenueTemplateType): VenueTemplate {
  return templates[type];
}

export function getAllTemplates(): VenueTemplate[] {
  return Object.values(templates);
}
