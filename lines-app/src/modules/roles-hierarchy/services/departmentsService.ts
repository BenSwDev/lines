import { prisma } from "@/core/integrations/prisma/client";
import type { Department } from "@prisma/client";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  DepartmentWithRelations
} from "../types";

export class DepartmentsService {
  async listDepartments(venueId: string): Promise<DepartmentWithRelations[]> {
    return prisma.department.findMany({
      where: {
        venueId,
        isActive: true
      },
      include: {
        parentDepartment: true,
        childDepartments: {
          where: { isActive: true }
        },
        roles: {
          where: { isActive: true }
        },
        _count: {
          select: {
            roles: true
          }
        }
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
  }

  async getDepartment(id: string): Promise<DepartmentWithRelations | null> {
    return prisma.department.findUnique({
      where: { id },
      include: {
        parentDepartment: true,
        childDepartments: {
          where: { isActive: true }
        },
        roles: {
          where: { isActive: true }
        },
        _count: {
          select: {
            roles: true
          }
        }
      }
    });
  }

  async createDepartment(venueId: string, input: CreateDepartmentInput): Promise<Department> {
    // Validate parent department exists and belongs to same venue
    if (input.parentDepartmentId) {
      const parent = await prisma.department.findFirst({
        where: {
          id: input.parentDepartmentId,
          venueId
        }
      });
      if (!parent) {
        throw new Error("Parent department not found or does not belong to this venue");
      }
    }

    return prisma.department.create({
      data: {
        venueId,
        name: input.name,
        description: input.description,
        color: input.color,
        icon: input.icon,
        parentDepartmentId: input.parentDepartmentId,
        order: input.order ?? 0
      }
    });
  }

  async updateDepartment(
    id: string,
    venueId: string,
    input: UpdateDepartmentInput
  ): Promise<Department> {
    // Verify department belongs to venue
    const existing = await prisma.department.findFirst({
      where: { id, venueId }
    });
    if (!existing) {
      throw new Error("Department not found or does not belong to this venue");
    }

    // Validate parent department if provided
    if (input.parentDepartmentId !== undefined && input.parentDepartmentId !== null) {
      const parent = await prisma.department.findFirst({
        where: {
          id: input.parentDepartmentId,
          venueId
        }
      });
      if (!parent) {
        throw new Error("Parent department not found or does not belong to this venue");
      }
      // Prevent circular reference
      if (input.parentDepartmentId === id) {
        throw new Error("Department cannot be its own parent");
      }
    }

    return prisma.department.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        color: input.color,
        icon: input.icon,
        parentDepartmentId: input.parentDepartmentId,
        order: input.order,
        isActive: input.isActive
      }
    });
  }

  async deleteDepartment(id: string, venueId: string): Promise<Department> {
    // Verify department belongs to venue
    const existing = await prisma.department.findFirst({
      where: { id, venueId },
      include: {
        roles: true,
        childDepartments: true
      }
    });
    if (!existing) {
      throw new Error("Department not found or does not belong to this venue");
    }

    // Check if department has roles
    if (existing.roles.length > 0) {
      throw new Error(
        "Cannot delete department with existing roles. Please remove or reassign roles first."
      );
    }

    // Check if department has child departments
    if (existing.childDepartments.length > 0) {
      throw new Error(
        "Cannot delete department with child departments. Please remove or reassign child departments first."
      );
    }

    return prisma.department.delete({
      where: { id }
    });
  }

  async getDepartmentHierarchy(venueId: string): Promise<DepartmentWithRelations[]> {
    // Get all top-level departments (no parent)
    return prisma.department.findMany({
      where: {
        venueId,
        isActive: true,
        parentDepartmentId: null
      },
      include: {
        parentDepartment: true,
        childDepartments: {
          where: { isActive: true },
          include: {
            roles: {
              where: { isActive: true }
            },
            childDepartments: {
              where: { isActive: true },
              include: {
                roles: {
                  where: { isActive: true }
                }
              }
            }
          }
        },
        roles: {
          where: { isActive: true }
        },
        _count: {
          select: {
            roles: true
          }
        }
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
  }
}

export const departmentsService = new DepartmentsService();
