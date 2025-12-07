import { prisma } from "@/core/integrations/prisma/client";
import type { Role } from "@prisma/client";
import type { CreateRoleInput, UpdateRoleInput, RoleWithRelations } from "../types";

export class RolesService {
  async listRoles(venueId: string, parentRoleId?: string | null): Promise<RoleWithRelations[]> {
    return prisma.role.findMany({
      where: {
        venueId,
        ...(parentRoleId !== undefined && { parentRoleId: parentRoleId || null }),
        isActive: true
      },
      include: {
        parentRole: true,
        childRoles: true
      },
      orderBy: [
        { order: "asc" },
        { name: "asc" }
      ]
    });
  }

  async getRole(id: string): Promise<RoleWithRelations | null> {
    return prisma.role.findUnique({
      where: { id },
      include: {
        parentRole: true,
        childRoles: true
      }
    });
  }

  async createRole(venueId: string, input: CreateRoleInput): Promise<Role> {
    // Validate parent role exists and belongs to same venue if provided
    if (input.parentRoleId) {
      const parentRole = await prisma.role.findFirst({
        where: {
          id: input.parentRoleId,
          venueId,
          isActive: true
        }
      });
      if (!parentRole) {
        throw new Error("Parent role not found or does not belong to this venue");
      }
    }

    return prisma.role.create({
      data: {
        venueId,
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        parentRoleId: input.parentRoleId,
        order: input.order ?? 0
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

    // Validate parent role if provided
    if (input.parentRoleId !== undefined) {
      if (input.parentRoleId) {
        // Check parent exists and belongs to same venue
        const parentRole = await prisma.role.findFirst({
          where: {
            id: input.parentRoleId,
            venueId,
            isActive: true
          }
        });
        if (!parentRole) {
          throw new Error("Parent role not found or does not belong to this venue");
        }
        // Prevent circular reference
        if (input.parentRoleId === id) {
          throw new Error("A role cannot be its own parent");
        }
      }
    }

    return prisma.role.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        parentRoleId: input.parentRoleId ?? undefined,
        order: input.order,
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

    // Check if role has child roles
    const childRoles = await prisma.role.findMany({
      where: { parentRoleId: id }
    });
    if (childRoles.length > 0) {
      throw new Error("Cannot delete role with child roles. Please reassign or delete child roles first.");
    }

    return prisma.role.delete({
      where: { id }
    });
  }

  async getRolesByParent(parentRoleId: string | null): Promise<RoleWithRelations[]> {
    return prisma.role.findMany({
      where: {
        parentRoleId,
        isActive: true
      },
      include: {
        parentRole: true,
        childRoles: true
      },
      orderBy: [
        { order: "asc" },
        { name: "asc" }
      ]
    });
  }
}

export const rolesService = new RolesService();
