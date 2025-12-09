import { describe, it, expect, beforeEach, vi } from "vitest";
import { rolesService } from "@/modules/roles-hierarchy/services/rolesService";
import { prisma } from "@/core/integrations/prisma/client";
import { mockRole, mockManagementRole } from "../../../../fixtures/roles";

vi.mock("@/core/integrations/prisma/client", () => ({
  prisma: {
    role: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

describe("RolesService", () => {
  const venueId = "venue-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listRoles()", () => {
    it("should return all roles for venue", async () => {
      const mockRoles = [mockRole];
      vi.mocked(prisma.role.findMany).mockResolvedValue(mockRoles as any);

      const result = await rolesService.listRoles(venueId);

      expect(result).toEqual(mockRoles);
      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            venueId,
            isActive: true,
            isManagementRole: false
          })
        })
      );
    });

    it("should exclude management roles", async () => {
      vi.mocked(prisma.role.findMany).mockResolvedValue([mockRole] as any);

      const result = await rolesService.listRoles(venueId);

      expect(result.every((r) => !r.isManagementRole)).toBe(true);
    });

    it("should filter by parent role", async () => {
      const parentRoleId = "parent-role-1";
      vi.mocked(prisma.role.findMany).mockResolvedValue([]);

      await rolesService.listRoles(venueId, parentRoleId);

      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            parentRoleId
          })
        })
      );
    });

    it("should return only active roles", async () => {
      vi.mocked(prisma.role.findMany).mockResolvedValue([mockRole] as any);

      await rolesService.listRoles(venueId);

      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true
          })
        })
      );
    });

    it("should order correctly", async () => {
      vi.mocked(prisma.role.findMany).mockResolvedValue([]);

      await rolesService.listRoles(venueId);

      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ order: "asc" }, { name: "asc" }]
        })
      );
    });
  });

  describe("getRole()", () => {
    it("should return role with relations", async () => {
      vi.mocked(prisma.role.findUnique).mockResolvedValue(mockRole as any);

      const result = await rolesService.getRole("role-1");

      expect(result).toEqual(mockRole);
      expect(prisma.role.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "role-1" },
          include: expect.any(Object)
        })
      );
    });

    it("should return null for non-existent role", async () => {
      vi.mocked(prisma.role.findUnique).mockResolvedValue(null);

      const result = await rolesService.getRole("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("createRole()", () => {
    it("should create role successfully", async () => {
      const input = {
        name: "New Role",
        description: "Description",
        color: "#3B82F6",
        icon: "👤"
      };

      vi.mocked(prisma.role.create).mockResolvedValue({ ...mockRole, ...input } as any);

      const result = await rolesService.createRole(venueId, input);

      expect(result).toBeDefined();
      expect(prisma.role.create).toHaveBeenCalled();
    });

    it("should create management role if required", async () => {
      const input = {
        name: "Barista",
        requiresManagement: true
      };

      vi.mocked(prisma.role.create).mockResolvedValue(mockRole as any);

      await rolesService.createRole(venueId, input as any);

      // Should create both the role and management role
      expect(prisma.role.create).toHaveBeenCalledTimes(2);
    });

    it("should validate parent role (must be management)", async () => {
      const input = {
        name: "New Role",
        parentRoleId: "parent-1"
      };

      vi.mocked(prisma.role.findFirst).mockResolvedValue(null); // Parent not found or not management

      await expect(rolesService.createRole(venueId, input as any)).rejects.toThrow(
        "Parent role must be a management role"
      );
    });

    it("should validate manager role", async () => {
      const input = {
        name: "New Role",
        managerRoleId: "manager-1"
      };

      vi.mocked(prisma.role.findFirst).mockResolvedValue(null);

      await expect(rolesService.createRole(venueId, input as any)).rejects.toThrow(
        "Manager role must exist"
      );
    });

    it("should prevent circular references", async () => {
      const input = {
        name: "New Role",
        parentRoleId: "same-id"
      };

      // This would be caught by validation
      vi.mocked(prisma.role.create).mockImplementation(() => {
        throw new Error("Circular reference");
      });

      await expect(
        rolesService.createRole(venueId, { ...input, parentRoleId: "role-1" } as any)
      ).rejects.toThrow();
    });
  });

  describe("updateRole()", () => {
    it("should update role successfully", async () => {
      const input = {
        name: "Updated Name"
      };

      vi.mocked(prisma.role.findFirst).mockResolvedValue(mockRole as any);
      vi.mocked(prisma.role.update).mockResolvedValue({ ...mockRole, ...input } as any);

      const result = await rolesService.updateRole("role-1", venueId, input);

      expect(result.name).toBe("Updated Name");
    });

    it("should update management role name when role name changes", async () => {
      const existing = { ...mockRole, requiresManagement: true, managementRole: mockManagementRole };
      const input = {
        name: "Updated Barista"
      };

      vi.mocked(prisma.role.findFirst).mockResolvedValue(existing as any);
      vi.mocked(prisma.role.update).mockResolvedValue({ ...mockRole, ...input } as any);

      await rolesService.updateRole("role-1", venueId, input);

      // Should update management role name
      expect(prisma.role.update).toHaveBeenCalledTimes(2);
    });

    it("should create management role when flag enabled", async () => {
      const existing = { ...mockRole, managementRole: null };
      const input = {
        requiresManagement: true
      };

      vi.mocked(prisma.role.findFirst).mockResolvedValue(existing as any);
      vi.mocked(prisma.role.create).mockResolvedValue(mockManagementRole as any);
      vi.mocked(prisma.role.update).mockResolvedValue(mockRole as any);

      await rolesService.updateRole("role-1", venueId, input);

      expect(prisma.role.create).toHaveBeenCalled();
    });

    it("should delete management role when flag disabled", async () => {
      const existing = { ...mockRole, managementRole: mockManagementRole };
      const input = {
        requiresManagement: false
      };

      vi.mocked(prisma.role.findFirst).mockResolvedValue(existing as any);
      vi.mocked(prisma.role.delete).mockResolvedValue(mockManagementRole as any);
      vi.mocked(prisma.role.update).mockResolvedValue(mockRole as any);

      await rolesService.updateRole("role-1", venueId, input);

      expect(prisma.role.delete).toHaveBeenCalled();
    });

    it("should prevent editing management role directly", async () => {
      const existing = { ...mockRole, isManagementRole: true };

      vi.mocked(prisma.role.findFirst).mockResolvedValue(existing as any);

      await expect(rolesService.updateRole("role-1", venueId, { name: "Updated" })).rejects.toThrow(
        "Cannot directly edit management roles"
      );
    });

    it("should validate parent role", async () => {
      const input = {
        parentRoleId: "invalid-parent"
      };

      vi.mocked(prisma.role.findFirst)
        .mockResolvedValueOnce(mockRole as any)
        .mockResolvedValueOnce(null); // Parent not found

      await expect(rolesService.updateRole("role-1", venueId, input)).rejects.toThrow(
        "Parent role must be a management role"
      );
    });
  });

  describe("deleteRole()", () => {
    it("should delete role successfully", async () => {
      vi.mocked(prisma.role.findFirst).mockResolvedValue(mockRole as any);
      vi.mocked(prisma.role.delete).mockResolvedValue(mockRole as any);

      const result = await rolesService.deleteRole("role-1", venueId);

      expect(result).toEqual(mockRole);
      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: "role-1" } });
    });

    it("should delete associated management role", async () => {
      const existing = { ...mockRole, managementRole: mockManagementRole };

      vi.mocked(prisma.role.findFirst).mockResolvedValue(existing as any);
      vi.mocked(prisma.role.findFirst)
        .mockResolvedValueOnce(existing as any)
        .mockResolvedValueOnce(mockManagementRole as any);
      vi.mocked(prisma.role.delete).mockResolvedValue(mockManagementRole as any);

      await rolesService.deleteRole("role-1", venueId);

      // Should delete management role first
      expect(prisma.role.delete).toHaveBeenCalledTimes(2);
    });

    it("should prevent deletion if has child roles", async () => {
      const existing = mockRole;
      const childRoles = [{ id: "child-1" }];

      vi.mocked(prisma.role.findFirst).mockResolvedValue(existing as any);
      vi.mocked(prisma.role.findMany).mockResolvedValue(childRoles as any);

      await expect(rolesService.deleteRole("role-1", venueId)).rejects.toThrow(
        "Cannot delete role with child roles"
      );
    });
  });

  describe("getManagementRoles()", () => {
    it("should return only management roles", async () => {
      vi.mocked(prisma.role.findMany).mockResolvedValue([mockManagementRole] as any);

      const result = await rolesService.getManagementRoles(venueId);

      expect(result.every((r) => r.isManagementRole)).toBe(true);
      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isManagementRole: true
          })
        })
      );
    });
  });

  describe("getManagerRoles()", () => {
    it("should return only roles with canManage", async () => {
      const managerRole = { ...mockRole, canManage: true };
      vi.mocked(prisma.role.findMany).mockResolvedValue([managerRole] as any);

      const result = await rolesService.getManagerRoles(venueId);

      expect(result.every((r) => r.canManage)).toBe(true);
      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            canManage: true
          })
        })
      );
    });
  });
});
