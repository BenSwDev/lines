// Test fixtures for Lines module

import type { Line, LineOccurrence } from "@prisma/client";

export const mockLine: Line = {
  id: "line-1",
  venueId: "venue-1",
  name: "Test Line",
  days: [1, 3, 5], // Monday, Wednesday, Friday
  startTime: "18:00",
  endTime: "22:00",
  frequency: "weekly",
  color: "#3B82F6",
  floorPlanId: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01")
};

export const mockLineMonthly: Line = {
  ...mockLine,
  id: "line-2",
  name: "Monthly Line",
  frequency: "monthly"
};

export const mockLineVariable: Line = {
  ...mockLine,
  id: "line-3",
  name: "Variable Line",
  frequency: "variable"
};

export const mockLineOneTime: Line = {
  ...mockLine,
  id: "line-4",
  name: "One Time Line",
  frequency: "oneTime"
};

export const mockOccurrence: LineOccurrence = {
  id: "occurrence-1",
  lineId: "line-1",
  venueId: "venue-1",
  date: "2025-01-06", // Monday
  startTime: "18:00",
  endTime: "22:00",
  isExpected: true,
  isActive: true,
  title: null,
  subtitle: null,
  description: null,
  location: null,
  contact: null,
  customFloorPlanId: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01")
};

export const mockOccurrenceInactive: LineOccurrence = {
  ...mockOccurrence,
  id: "occurrence-2",
  isActive: false,
  title: null,
  subtitle: null,
  description: null,
  location: null,
  contact: null,
  customFloorPlanId: null
};

export const mockOccurrenceManual: LineOccurrence = {
  ...mockOccurrence,
  id: "occurrence-3",
  isExpected: false,
  title: null,
  subtitle: null,
  description: null,
  location: null,
  contact: null,
  customFloorPlanId: null
};
