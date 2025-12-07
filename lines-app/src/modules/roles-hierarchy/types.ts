import type { Department, Role } from "@prisma/client";

export type DepartmentWithRelations = Department & {
  parentDepartment: Department | null;
  childDepartments: Department[];
  roles: Role[];
  _count?: {
    roles: number;
  };
};

export type RoleWithRelations = Role & {
  department: Department;
  _count?: {
    assignments?: number;
  };
};

export type HierarchyNode = {
  id: string;
  type: "department" | "role";
  name: string;
  color: string;
  icon?: string;
  children: HierarchyNode[];
  data: Department | Role;
};

export type CreateDepartmentInput = {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parentDepartmentId?: string;
  order?: number;
};

export type UpdateDepartmentInput = {
  name?: string;
  description?: string | null;
  color?: string;
  icon?: string | null;
  parentDepartmentId?: string | null;
  order?: number;
  isActive?: boolean;
};

export type CreateRoleInput = {
  name: string;
  description?: string;
  icon?: string;
  color: string;
  departmentId: string;
};

export type UpdateRoleInput = {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string;
  departmentId?: string;
  isActive?: boolean;
};
