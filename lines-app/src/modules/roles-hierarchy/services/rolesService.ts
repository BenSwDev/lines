import { prisma } from "@/core/integrations/prisma/client";
import type { Role } from "@prisma/client";
import type { CreateRoleInput, UpdateRoleInput, RoleWithRelations } from "../types";

export class RolesService {
  async listRoles(venueId: string, departmentId?: string): Promise<RoleWithRelations[]> {
    return prisma.role.findMany({
      where: {
        venueId,
        ...(departmentId && { departmentId }),
        isActive: true
      },
      include: {
        department: true
      },
      orderBy: {
        name: "asc"
      }
    });
  }

  async getRole(id: string): Promise<RoleWithRelations | null> {
    return prisma.role.findUnique({
      where: { id },
      include: {
        department: true
      }
    });
  }

  async createRole(venueId: string, input: CreateRoleInput): Promise<Role> {
    // Validate department exists and belongs to same venue
    const department = await prisma.department.findFirst({
      where: {
        id: input.departmentId,
        venueId,
        isActive: true
      }
    });
    if (!department) {
      throw new Error("Department not found or does not belong to this venue");
    }

    return prisma.role.create({
      data: {
        venueId,
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        departmentId: input.departmentId
      }
    });
  }

  async updateRole(id: string, venueId: string, input: UpdateRoleInput): Promise<Role> {
    // Verify role belongs to venue
    const existing = await prisma.role.findFirst({
      where: { id, venueId }
    });
    if (!existing) {
      throw new Error("Role not found or does not belong to this venue");
    }

    // Validate department if provided
    if (input.departmentId) {
      const department = await prisma.department.findFirst({
        where: {
          id: input.departmentId,
          venueId,
          isActive: true
        }
      });
      if (!department) {
        throw new Error("Department not found or does not belong to this venue");
      }
    }

    return prisma.role.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        departmentId: input.departmentId,
        isActive: input.isActive
      }
    });
  }

  async deleteRole(id: string, venueId: string): Promise<Role> {
    // Verify role belongs to venue
    const existing = await prisma.role.findFirst({
      where: { id, venueId }
    });
    if (!existing) {
      throw new Error("Role not found or does not belong to this venue");
    }

    // Note: In the future, if we add staff assignments, we should check for those here
    // For now, we can safely delete roles

    return prisma.role.delete({
      where: { id }
    });
  }

  async getRolesByDepartment(departmentId: string): Promise<RoleWithRelations[]> {
    return prisma.role.findMany({
      where: {
        departmentId,
        isActive: true
      },
      include: {
        department: true
      },
      orderBy: {
        name: "asc"
      }
    });
  }
}

export const rolesService = new RolesService();
