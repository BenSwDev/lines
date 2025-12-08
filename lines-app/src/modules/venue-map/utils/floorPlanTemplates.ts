import type { FloorPlanElement, ElementType, SpecialAreaType } from "../types";

export type VenueTemplateType =
  | "event_hall"
  | "bar"
  | "club"
  | "restaurant"
  | "conference_hall"
  | "concert_hall"
  | "shalvata"
  | "empty";

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
function scaleToCanvas(
  elements: FloorPlanElement[],
  targetWidth: number,
  targetHeight: number
): FloorPlanElement[] {
  if (elements.length === 0) return elements;

  // Find bounds of all elements
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
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

  // Scale all elements and center on infinite canvas (1000x1000 center - middle of 2000x2000 canvas)
  const centerX = 1000;
  const centerY = 1000;

  return elements.map((el) => ({
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

// Shalvata Club Template - Based on actual floor plan
const shalvataTemplateRaw: VenueTemplate = {
  id: "shalvata",
  name: "שלוותה",
  description: "תבנית מועדון שלוותה - כולל כל האזורים והשולחנות הממוספרים",
  defaultCapacity: 500,
  elements: [
    // Entrance (top right)
    {
      id: "entrance-1",
      type: "specialArea" as ElementType,
      name: "כניסה",
      x: 1400,
      y: 50,
      width: 150,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "entrance" as SpecialAreaType,
      color: "#10B981"
    },
    // Restroom near entrance (top right)
    {
      id: "restroom-1",
      type: "specialArea" as ElementType,
      name: "שירותים",
      x: 1400,
      y: 180,
      width: 100,
      height: 80,
      rotation: 0,
      shape: "rectangle",
      areaType: "restroom" as SpecialAreaType,
      color: "#06B6D4"
    },
    // Upper left seating area - booths 100-270
    // Zone for upper left area
    {
      id: "zone-upper-left",
      type: "zone" as ElementType,
      name: "אזור ישיבה עליון שמאל",
      x: 50,
      y: 50,
      width: 600,
      height: 700,
      rotation: 0,
      shape: "rectangle",
      zoneType: "seating_area",
      color: "#3B82F6"
    },
    // Booths 100-130 (top row)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `table-${130 - i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${130 - i * 10}`,
      x: 100 + i * 120,
      y: 100,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 6,
      zoneId: "zone-upper-left"
    })),
    // Booths 140-190 (middle vertical)
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `table-${140 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${140 + i * 10}`,
      x: 200,
      y: 200 + i * 80,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 6,
      zoneId: "zone-upper-left"
    })),
    // Booths 210-270 (left vertical)
    ...Array.from({ length: 7 }, (_, i) => ({
      id: `table-${210 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${210 + i * 10}`,
      x: 100,
      y: 200 + i * 80,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 6,
      zoneId: "zone-upper-left"
    })),
    // Upper right seating area - tables 600-660
    // Zone for upper right area
    {
      id: "zone-upper-right",
      type: "zone" as ElementType,
      name: "אזור ישיבה עליון ימין",
      x: 1200,
      y: 50,
      width: 200,
      height: 500,
      rotation: 0,
      shape: "rectangle",
      zoneType: "seating_area",
      color: "#3B82F6"
    },
    // Tables 600-660 (vertical row)
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `table-${600 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${600 + i * 10}`,
      x: 1250,
      y: 100 + i * 70,
      width: 60,
      height: 60,
      rotation: 0,
      shape: "circle" as const,
      seats: 4,
      zoneId: "zone-upper-right"
    })),
    // Tables 605, 615 (clusters near entrance)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `table-${605 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${605 + i * 10}`,
      x: 1350 + (i % 2) * 30,
      y: 300 + Math.floor(i / 2) * 30,
      width: 50,
      height: 50,
      rotation: 0,
      shape: "circle" as const,
      seats: 4,
      zoneId: "zone-upper-right"
    })),
    // UPER BAR (center top) - oval bar
    {
      id: "zone-uper-bar",
      type: "zone" as ElementType,
      name: "בר עליון",
      x: 650,
      y: 100,
      width: 500,
      height: 400,
      rotation: 0,
      shape: "rectangle",
      zoneType: "bar_area",
      color: "#EF4444"
    },
    // UPER BAR counter (oval shape approximated as rectangle)
    {
      id: "bar-uper",
      type: "table" as ElementType,
      name: "בר עליון",
      x: 700,
      y: 200,
      width: 400,
      height: 200,
      rotation: 0,
      shape: "rectangle",
      tableType: "bar",
      seats: 30,
      zoneId: "zone-uper-bar"
    },
    // Bar stools around UPER BAR
    ...Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 120;
      return {
        id: `stool-uper-${i + 1}`,
        type: "table" as ElementType,
        name: `כיסא בר ${i + 1}`,
        x: 850 + Math.cos(angle) * radius - 15,
        y: 300 + Math.sin(angle) * radius - 15,
        width: 30,
        height: 30,
        rotation: 0,
        shape: "circle" as const,
        tableType: "bar" as const,
        seats: 1,
        zoneId: "zone-uper-bar"
      };
    }),
    // Tables near UPER BAR (10, 20, 30, 40, 50, 90)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `table-${10 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${10 + i * 10}`,
      x: 550 + (i % 3) * 60,
      y: 150 + Math.floor(i / 3) * 60,
      width: 50,
      height: 50,
      rotation: 0,
      shape: "circle" as const,
      seats: 4
    })),
    {
      id: "table-90",
      type: "table" as ElementType,
      name: "שולחן 90",
      x: 1150,
      y: 550,
      width: 50,
      height: 50,
      rotation: 0,
      shape: "circle" as const,
      seats: 4
    },
    // MAIN BARS (center) - two rectangular bars
    {
      id: "zone-main-bars",
      type: "zone" as ElementType,
      name: "בר ראשי",
      x: 600,
      y: 550,
      width: 600,
      height: 300,
      rotation: 0,
      shape: "rectangle",
      zoneType: "bar_area",
      color: "#EF4444"
    },
    // Main bar counter 1
    {
      id: "bar-main-1",
      type: "table" as ElementType,
      name: "בר ראשי 1",
      x: 650,
      y: 600,
      width: 250,
      height: 80,
      rotation: -15,
      shape: "rectangle",
      tableType: "bar",
      seats: 15,
      zoneId: "zone-main-bars"
    },
    // Main bar counter 2
    {
      id: "bar-main-2",
      type: "table" as ElementType,
      name: "בר ראשי 2",
      x: 900,
      y: 650,
      width: 250,
      height: 80,
      rotation: 15,
      shape: "rectangle",
      tableType: "bar",
      seats: 15,
      zoneId: "zone-main-bars"
    },
    // Bar stools around MAIN BARS
    ...Array.from({ length: 30 }, (_, i) => {
      const barIndex = i < 15 ? 0 : 1;
      const offset = barIndex * 50;
      const angle = ((i % 15) / 15) * Math.PI;
      return {
        id: `stool-main-${i + 1}`,
        type: "table" as ElementType,
        name: `כיסא בר ${i + 1}`,
        x: 700 + offset + Math.cos(angle) * 100 - 15,
        y: 640 + Math.sin(angle) * 100 - 15,
        width: 30,
        height: 30,
        rotation: 0,
        shape: "circle" as const,
        tableType: "bar" as const,
        seats: 1,
        zoneId: "zone-main-bars"
      };
    }),
    // DJ area (center bottom)
    {
      id: "dj-area",
      type: "specialArea" as ElementType,
      name: "דיג'יי",
      x: 800,
      y: 900,
      width: 200,
      height: 150,
      rotation: 0,
      shape: "rectangle",
      areaType: "dj_booth" as SpecialAreaType,
      color: "#8B5CF6"
    },
    // GOLDEN sections around DJ
    {
      id: "zone-golden-left",
      type: "zone" as ElementType,
      name: "גולדן שמאל",
      x: 550,
      y: 900,
      width: 200,
      height: 200,
      rotation: 0,
      shape: "rectangle",
      zoneType: "vip_zone",
      color: "#F59E0B"
    },
    // Golden booths left (410, 415, 420)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `table-${410 + i * 5}`,
      type: "table" as ElementType,
      name: `שולחן ${410 + i * 5}`,
      x: 600 + i * 50,
      y: 950,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 6,
      zoneId: "zone-golden-left"
    })),
    {
      id: "zone-golden-right",
      type: "zone" as ElementType,
      name: "גולדן ימין",
      x: 1050,
      y: 900,
      width: 250,
      height: 200,
      rotation: 0,
      shape: "rectangle",
      zoneType: "vip_zone",
      color: "#F59E0B"
    },
    // Golden booths right (430, 440, 450, 460)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `table-${430 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${430 + i * 10}`,
      x: 1100 + i * 50,
      y: 950,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 6,
      zoneId: "zone-golden-right"
    })),
    // Left vertical seating (310, 320)
    {
      id: "zone-left-vertical",
      type: "zone" as ElementType,
      name: "אזור שמאל",
      x: 50,
      y: 800,
      width: 200,
      height: 300,
      rotation: 0,
      shape: "rectangle",
      zoneType: "seating_area",
      color: "#3B82F6"
    },
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `table-${310 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${310 + i * 10}`,
      x: 100,
      y: 850 + i * 100,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 6,
      zoneId: "zone-left-vertical"
    })),
    // Restroom left side
    {
      id: "restroom-2",
      type: "specialArea" as ElementType,
      name: "שירותים",
      x: 50,
      y: 1150,
      width: 100,
      height: 80,
      rotation: 0,
      shape: "rectangle",
      areaType: "restroom" as SpecialAreaType,
      color: "#06B6D4"
    },
    // Central lower seating (510-570)
    {
      id: "zone-central-lower",
      type: "zone" as ElementType,
      name: "אזור מרכז תחתון",
      x: 300,
      y: 1150,
      width: 900,
      height: 150,
      rotation: 0,
      shape: "rectangle",
      zoneType: "seating_area",
      color: "#3B82F6"
    },
    // Tables 510-570 (horizontal row)
    ...Array.from({ length: 12 }, (_, i) => {
      const tableNumbers = [510, 515, 520, 525, 530, 535, 540, 545, 550, 555, 560, 570];
      return {
        id: `table-${tableNumbers[i]}`,
        type: "table" as ElementType,
        name: `שולחן ${tableNumbers[i]}`,
        x: 350 + i * 70,
        y: 1200,
        width: 60,
        height: 60,
        rotation: 0,
        shape: "rectangle" as const,
        seats: 4,
        zoneId: "zone-central-lower"
      };
    }),
    // Exit left
    {
      id: "exit-1",
      type: "specialArea" as ElementType,
      name: "יציאה",
      x: 250,
      y: 1150,
      width: 50,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "exit" as SpecialAreaType,
      color: "#EF4444"
    },
    // Exit right
    {
      id: "exit-2",
      type: "specialArea" as ElementType,
      name: "יציאה",
      x: 1200,
      y: 1150,
      width: 50,
      height: 100,
      rotation: 0,
      shape: "rectangle",
      areaType: "exit" as SpecialAreaType,
      color: "#EF4444"
    },
    // NORTH BAR (bottom left)
    {
      id: "zone-north-bar",
      type: "zone" as ElementType,
      name: "בר צפון",
      x: 50,
      y: 1300,
      width: 400,
      height: 300,
      rotation: 0,
      shape: "rectangle",
      zoneType: "bar_area",
      color: "#EF4444"
    },
    // North bar counter
    {
      id: "bar-north",
      type: "table" as ElementType,
      name: "בר צפון",
      x: 200,
      y: 1450,
      width: 200,
      height: 80,
      rotation: 0,
      shape: "rectangle",
      tableType: "bar",
      seats: 12,
      zoneId: "zone-north-bar"
    },
    // Tables near NORTH BAR (810, 820, 830, 840, 850)
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `table-${810 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${810 + i * 10}`,
      x: 100 + (i % 3) * 60,
      y: 1350 + Math.floor(i / 3) * 60,
      width: 50,
      height: 50,
      rotation: 0,
      shape: "circle" as const,
      seats: 4,
      zoneId: "zone-north-bar"
    })),
    // SOUTH BAR (bottom right)
    {
      id: "zone-south-bar",
      type: "zone" as ElementType,
      name: "בר דרום",
      x: 1000,
      y: 1300,
      width: 400,
      height: 300,
      rotation: 0,
      shape: "rectangle",
      zoneType: "bar_area",
      color: "#EF4444"
    },
    // South bar counter
    {
      id: "bar-south",
      type: "table" as ElementType,
      name: "בר דרום",
      x: 1150,
      y: 1450,
      width: 200,
      height: 80,
      rotation: 0,
      shape: "rectangle",
      tableType: "bar",
      seats: 12,
      zoneId: "zone-south-bar"
    },
    // Tables near SOUTH BAR (710, 720, 730, 740, 750, 760, 770)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `table-${710 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${710 + i * 10}`,
      x: 1050 + i * 60,
      y: 1350,
      width: 60,
      height: 60,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 4,
      zoneId: "zone-south-bar"
    })),
    {
      id: "table-740",
      type: "table" as ElementType,
      name: "שולחן 740",
      x: 1200,
      y: 1420,
      width: 80,
      height: 80,
      rotation: 0,
      shape: "rectangle" as const,
      seats: 6,
      zoneId: "zone-south-bar"
    },
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `table-${750 + i * 10}`,
      type: "table" as ElementType,
      name: `שולחן ${750 + i * 10}`,
      x: 1050 + i * 60,
      y: 1520,
      width: 50,
      height: 50,
      rotation: 0,
      shape: "circle" as const,
      seats: 4,
      zoneId: "zone-south-bar"
    }))
  ]
};

// Scale Shalvata template to fit default canvas size
export const shalvataTemplate: VenueTemplate = {
  ...shalvataTemplateRaw,
  elements: scaleToCanvas(shalvataTemplateRaw.elements, CANVAS_WIDTH, CANVAS_HEIGHT)
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
  shalvata: shalvataTemplate,
  empty: emptyTemplate
};

export function getTemplate(type: VenueTemplateType): VenueTemplate {
  return templates[type];
}

export function getAllTemplates(): VenueTemplate[] {
  return Object.values(templates);
}
