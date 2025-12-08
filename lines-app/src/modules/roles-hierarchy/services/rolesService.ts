import { prisma } from "@/core/integrations/prisma/client";
import type { Role } from "@prisma/client";
import type { CreateRoleInput, UpdateRoleInput, RoleWithRelations } from "../types";

export class RolesService {
  async listRoles(venueId: string, parentRoleId?: string | null): Promise<RoleWithRelations[]> {
    return prisma.role.findMany({
      where: {
        venueId,
        ...(parentRoleId !== undefined && { parentRoleId: parentRoleId || null }),
        isActive: true,
        isManagementRole: false // Exclude management roles from regular listing
      },
      include: {
        parentRole: true,
        childRoles: true,
        managedRole: true,
        managementRole: true,
        managerRole: true,
        managedRoles: true
      },
      orderBy: [{ order: "asc" }, { name: "asc" }]
    });
  }

  async getRole(id: string): Promise<RoleWithRelations | null> {
    return prisma.role.findUnique({
      where: { id },
      include: {
        parentRole: true,
        childRoles: true,
        managedRole: true,
        managementRole: true,
        managerRole: true,
        managedRoles: true
      }
    });
  }

  async createRole(venueId: string, input: CreateRoleInput): Promise<Role> {
    // Validate parent role exists and belongs to same venue if provided
    // Only management roles can be parents
    if (input.parentRoleId) {
      const parentRole = await prisma.role.findFirst({
        where: {
          id: input.parentRoleId,
          venueId,
          isActive: true,
          isManagementRole: true
        }
      });
      if (!parentRole) {
        throw new Error("Parent role must be a management role and belong to this venue");
      }
    }

    // Validate managerRoleId if provided
    if (input.managerRoleId) {
      const managerRole = await prisma.role.findFirst({
        where: {
          id: input.managerRoleId,
          venueId,
          isActive: true,
          canManage: true // Manager role must have canManage = true
        }
      });
      if (!managerRole) {
        throw new Error(
          "Manager role must exist, belong to this venue, and have canManage enabled"
        );
      }
    }

    // Create the role
    const role = await prisma.role.create({
      data: {
        venueId,
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        parentRoleId: input.parentRoleId,
        managerRoleId: input.managerRoleId,
        order: input.order ?? 0,
        requiresManagement: input.requiresManagement ?? false,
        requiresStaffing: input.requiresStaffing ?? false,
        canManage: input.canManage ?? false
      }
    });

    // If role requires management, create a management role automatically
    if (input.requiresManagement) {
      await prisma.role.create({
        data: {
          venueId,
          name: `ניהול ${input.name}`,
          description: `תפקיד ניהול עבור ${input.name}`,
          icon: "👔",
          color: input.color,
          isManagementRole: true,
          managedRoleId: role.id,
          order: (input.order ?? 0) + 1
        }
      });
    }

    return role;
  }

  async updateRole(id: string, venueId: string, input: UpdateRoleInput): Promise<Role> {
    // Verify role belongs to venue and is not a management role
    const existing = await prisma.role.findFirst({
      where: { id, venueId },
      include: { managementRole: true }
    });
    if (!existing) {
      throw new Error("Role not found or does not belong to this venue");
    }
    if (existing.isManagementRole) {
      throw new Error("Cannot directly edit management roles. Edit the managed role instead.");
    }

    // Validate parent role if provided - only management roles can be parents
    if (input.parentRoleId !== undefined) {
      if (input.parentRoleId) {
        // Check parent exists, belongs to same venue, and is a management role
        const parentRole = await prisma.role.findFirst({
          where: {
            id: input.parentRoleId,
            venueId,
            isActive: true,
            isManagementRole: true
          }
        });
        if (!parentRole) {
          throw new Error("Parent role must be a management role and belong to this venue");
        }
        // Prevent circular reference
        if (input.parentRoleId === id) {
          throw new Error("A role cannot be its own parent");
        }
      }
    }

    // Handle requiresManagement flag change
    const requiresManagement = input.requiresManagement ?? existing.requiresManagement;
    const hadManagement = existing.managementRole !== null;
    const needsManagement = requiresManagement && !hadManagement;
    const shouldRemoveManagement = !requiresManagement && hadManagement;

    // Create management role if needed
    if (needsManagement) {
      await prisma.role.create({
        data: {
          venueId,
          name: `ניהול ${input.name ?? existing.name}`,
          description: `תפקיד ניהול עבור ${input.name ?? existing.name}`,
          icon: "👔",
          color: input.color ?? existing.color,
          isManagementRole: true,
          managedRoleId: id,
          order: (input.order ?? existing.order ?? 0) + 1
        }
      });
    }

    // Delete management role if no longer needed
    if (shouldRemoveManagement && existing.managementRole) {
      await prisma.role.delete({
        where: { id: existing.managementRole.id }
      });
    }

    // Validate managerRoleId if provided
    if (input.managerRoleId !== undefined) {
      if (input.managerRoleId) {
        const managerRole = await prisma.role.findFirst({
          where: {
            id: input.managerRoleId,
            venueId,
            isActive: true,
            canManage: true
          }
        });
        if (!managerRole) {
          throw new Error(
            "Manager role must exist, belong to this venue, and have canManage enabled"
          );
        }
        // Prevent circular reference
        if (input.managerRoleId === id) {
          throw new Error("A role cannot be its own manager");
        }
      }
    }

    // Update the role
    return prisma.role.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        parentRoleId: input.parentRoleId ?? undefined,
        managerRoleId: input.managerRoleId ?? undefined,
        order: input.order,
        isActive: input.isActive,
        requiresManagement: input.requiresManagement ?? undefined,
        requiresStaffing: input.requiresStaffing ?? undefined,
        canManage: input.canManage ?? undefined
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
      throw new Error(
        "Cannot delete role with child roles. Please reassign or delete child roles first."
      );
    }

    // If role has a management role, delete it first
    const managementRole = await prisma.role.findFirst({
      where: { managedRoleId: id }
    });
    if (managementRole) {
      await prisma.role.delete({
        where: { id: managementRole.id }
      });
    }

    return prisma.role.delete({
      where: { id }
    });
  }

  async getRolesByParent(parentRoleId: string | null): Promise<RoleWithRelations[]> {
    return prisma.role.findMany({
      where: {
        parentRoleId,
        isActive: true,
        isManagementRole: false
      },
      include: {
        parentRole: true,
        childRoles: true,
        managedRole: true,
        managementRole: true,
        managerRole: true,
        managedRoles: true
      },
      orderBy: [{ order: "asc" }, { name: "asc" }]
    });
  }

  // Get all management roles for a venue (used for parent selection)
  async getManagementRoles(venueId: string): Promise<RoleWithRelations[]> {
    return prisma.role.findMany({
      where: {
        venueId,
        isActive: true,
        isManagementRole: true
      },
      include: {
        parentRole: true,
        childRoles: true,
        managedRole: true,
        managementRole: true,
        managerRole: true,
        managedRoles: true
      },
      orderBy: [{ order: "asc" }, { name: "asc" }]
    });
  }

  // Get all roles that can manage other roles (canManage = true)
  async getManagerRoles(venueId: string): Promise<RoleWithRelations[]> {
    return prisma.role.findMany({
      where: {
        venueId,
        isActive: true,
        canManage: true
      },
      include: {
        parentRole: true,
        childRoles: true,
        managedRole: true,
        managementRole: true,
        managerRole: true,
        managedRoles: true
      },
      orderBy: [{ order: "asc" }, { name: "asc" }]
    });
  }
}

export const rolesService = new RolesService();
