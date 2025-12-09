// Test fixtures for Roles & Hierarchy module

import type { Role } from "@prisma/client";

export const mockRole: Role = {
  id: "role-1",
  venueId: "venue-1",
  name: "Barista",
  description: "Coffee barista",
  icon: "☕",
  color: "#3B82F6",
  parentRoleId: null,
  managerRoleId: null,
  order: 0,
  isActive: true,
  requiresManagement: false,
  isManagementRole: false,
  managedRoleId: null,
  requiresStaffing: false,
  canManage: false,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01")
};

export const mockManagementRole: Role = {
  ...mockRole,
  id: "role-2",
  name: "ניהול Barista",
  isManagementRole: true,
  managedRoleId: "role-1",
  icon: "👔"
};

export const mockManagerRole: Role = {
  ...mockRole,
  id: "role-3",
  name: "Manager",
  canManage: true,
  icon: "👤"
};
