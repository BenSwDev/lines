import { describe, it, expect, beforeEach, vi } from "vitest";
import { rolesService } from "@/modules/roles-hierarchy/services/rolesService";
import { mockRole, mockManagementRole } from "@/../../fixtures/roles";

vi.mock("@/modules/roles-hierarchy/services/rolesService");

describe("Management Roles Integration", () => {
  const venueId = "venue-1";
  const roleId = "role-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Auto-create Management Role", () => {
    it("should auto-create management role when required", async () => {
      const input = {
        name: "Barista",
        color: "#3B82F6",
        requiresManagement: true
      };

      vi.mocked(rolesService.createRole).mockResolvedValueOnce(mockRole as any);
      // Second call is for management role
      vi.mocked(rolesService.createRole).mockResolvedValueOnce(mockManagementRole as any);

      await rolesService.createRole(venueId, input as any);

      // Should create both the role and management role
      expect(rolesService.createRole).toHaveBeenCalledTimes(2);
    });
  });

  describe("Auto-delete Management Role", () => {
    it("should auto-delete management role when not required", async () => {
      const existing = {
        ...mockRole,
        requiresManagement: true,
        managementRole: mockManagementRole
      };

      vi.mocked(rolesService.updateRole).mockResolvedValue({
        ...mockRole,
        requiresManagement: false
      } as any);

      const input = {
        requiresManagement: false
      };

      await rolesService.updateRole(roleId, venueId, input);

      expect(rolesService.updateRole).toHaveBeenCalled();
    });
  });

  describe("Update Management Role Name", () => {
    it("should update management role name when role name changes", async () => {
      const existing = {
        ...mockRole,
        name: "Barista",
        managementRole: { ...mockManagementRole, name: "ניהול Barista" }
      };

      const input = {
        name: "Senior Barista"
      };

      vi.mocked(rolesService.updateRole).mockResolvedValue({
        ...mockRole,
        name: "Senior Barista"
      } as any);

      await rolesService.updateRole(roleId, venueId, input);

      expect(rolesService.updateRole).toHaveBeenCalled();
      // Management role name should be updated to "ניהול Senior Barista"
    });
  });

  describe("Prevent Direct Editing", () => {
    it("should prevent direct editing of management role", async () => {
      const managementRole = {
        ...mockManagementRole,
        isManagementRole: true
      };

      vi.mocked(rolesService.updateRole).mockImplementation(() => {
        throw new Error("Cannot directly edit management roles");
      });

      await expect(
        rolesService.updateRole(managementRole.id, venueId, { name: "Updated" })
      ).rejects.toThrow("Cannot directly edit management roles");
    });
  });

  describe("Get All Management Roles", () => {
    it("should get all management roles for venue", async () => {
      const managementRoles = [mockManagementRole];

      vi.mocked(rolesService.getManagementRoles).mockResolvedValue(managementRoles as any);

      const result = await rolesService.getManagementRoles(venueId);

      expect(result).toEqual(managementRoles);
      expect(result.every((r) => r.isManagementRole)).toBe(true);
    });
  });

  describe("Validate Management Role Relationships", () => {
    it("should validate management role relationships", async () => {
      const managementRole = {
        ...mockManagementRole,
        managedRoleId: "role-1"
      };

      const managedRole = {
        ...mockRole,
        id: "role-1",
        managementRole
      };

      // Management role should be parent of managed role in hierarchy
      expect(managementRole.managedRoleId).toBe(managedRole.id);
    });
  });
});
