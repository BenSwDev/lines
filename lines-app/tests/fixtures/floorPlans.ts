// Test fixtures for Floor Plan Editor module

import { Decimal } from "@prisma/client/runtime/library";
import type { Table, Zone, VenueArea } from "@prisma/client";

// Using type assertions since Prisma client types may be out of sync with schema
// These fixtures match the actual database schema structure
export const mockFloorPlan = {
  id: "floor-plan-1",
  venueId: "venue-1",
  name: "Main Floor",
  description: null,
  isDefault: true,
  isLocked: false,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01")
} as {
  id: string;
  venueId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const mockZone = {
  id: "zone-1",
  venueId: "venue-1",
  floorPlanId: "floor-plan-1",
  name: "VIP Zone",
  color: "#3B82F6",
  description: null,
  zoneNumber: 1,
  zoneType: "seating",
  isKitchen: false,
  positionX: new Decimal(100),
  positionY: new Decimal(100),
  width: new Decimal(200),
  height: new Decimal(200),
  shape: "rectangle",
  polygonPoints: null,
  barNumber: null,
  barName: null,
  barSeats: null,
  barMinimumPrice: null,
  staffingRules: null,
  zoneMinimumPrice: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01")
} as Zone;

export const mockTable = {
  id: "table-1",
  zoneId: "zone-1",
  name: "Table 1",
  tableNumber: 1,
  seats: 4,
  notes: null,
  positionX: new Decimal(150),
  positionY: new Decimal(150),
  width: new Decimal(50),
  height: new Decimal(50),
  rotation: new Decimal(0),
  shape: "rectangle",
  tableType: "table",
  staffingRules: null,
  minimumPrice: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01")
} as Table;

export const mockVenueArea = {
  id: "area-1",
  venueId: "venue-1",
  floorPlanId: "floor-plan-1",
  areaType: "kitchen",
  name: "Kitchen",
  positionX: new Decimal(0),
  positionY: new Decimal(0),
  width: new Decimal(100),
  height: new Decimal(100),
  rotation: new Decimal(0),
  shape: "rectangle",
  icon: null,
  color: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01")
} as VenueArea;
