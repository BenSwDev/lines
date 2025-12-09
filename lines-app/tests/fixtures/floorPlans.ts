// Test fixtures for Floor Plan Editor module

import { Decimal } from "@prisma/client/runtime/library";
import type { FloorPlan, Zone, Table, VenueArea } from "@prisma/client";

export const mockFloorPlan: FloorPlan = {
  id: "floor-plan-1",
  venueId: "venue-1",
  name: "Main Floor",
  description: null,
  isDefault: true,
  isLocked: false,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01")
};

export const mockZone: Zone = {
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
};

export const mockTable: Table = {
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
};

export const mockVenueArea: VenueArea = {
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
};
