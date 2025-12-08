import type { Role } from "@prisma/client";

export type RoleWithRelations = Role & {
  parentRole: Role | null;
  childRoles: Role[];
  managedRole: Role | null;
  managementRole: Role | null;
  managerRole: Role | null; // Role that manages this role
  managedRoles: Role[]; // Roles managed by this role
  _count?: {
    childRoles?: number;
    managedRoles?: number;
  };
};

export type HierarchyNode = {
  id: string;
  type: "role";
  name: string;
  color: string;
  icon?: string;
  children: HierarchyNode[];
  data: Role;
  depth?: number;
};

export type CreateRoleInput = {
  name: string;
  description?: string;
  icon?: string;
  color: string;
  parentRoleId?: string;
  managerRoleId?: string; // Role that manages this role
  order?: number;
  requiresManagement?: boolean;
  requiresStaffing?: boolean; // Does this role need staffing assignment?
  canManage?: boolean; // Can this role have managers?
};

export type UpdateRoleInput = {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string;
  parentRoleId?: string | null;
  managerRoleId?: string | null; // Role that manages this role
  order?: number;
  isActive?: boolean;
  requiresManagement?: boolean;
  requiresStaffing?: boolean; // Does this role need staffing assignment?
  canManage?: boolean; // Can this role have managers?
};
