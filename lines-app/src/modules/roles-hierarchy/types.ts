import type { Role } from "@prisma/client";

export type RoleWithRelations = Role & {
  parentRole: Role | null;
  childRoles: Role[];
  _count?: {
    childRoles?: number;
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
  order?: number;
};

export type UpdateRoleInput = {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string;
  parentRoleId?: string | null;
  order?: number;
  isActive?: boolean;
};
