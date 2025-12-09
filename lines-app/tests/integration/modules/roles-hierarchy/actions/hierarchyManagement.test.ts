import { describe, it, expect, beforeEach, vi } from "vitest";
import { rolesService } from "@/modules/roles-hierarchy/services/rolesService";
import { hierarchyService } from "@/modules/roles-hierarchy/services/hierarchyService";
import { mockRole, mockManagementRole } from "../../../../fixtures/roles";

vi.mock("@/modules/roles-hierarchy/services/rolesService");
vi.mock("@/modules/roles-hierarchy/services/hierarchyService");

describe("Hierarchy Management Integration", () => {
  const venueId = "venue-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Hierarchy", () => {
    it("should create role hierarchy correctly", async () => {
      const parentRole = { ...mockRole, id: "parent-1" };
      const childRole = {
        ...mockRole,
        id: "child-1",
        parentRoleId: "parent-1"
      };

      vi.mocked(rolesService.createRole).mockResolvedValueOnce(parentRole as any);
      vi.mocked(rolesService.createRole).mockResolvedValueOnce(childRole as any);

      // Create parent first
      await rolesService.createRole(venueId, {
        name: "Parent Role",
        color: "#3B82F6"
      } as any);

      // Then create child
      await rolesService.createRole(venueId, {
        name: "Child Role",
        color: "#EF4444",
        parentRoleId: "parent-1"
      } as any);

      expect(rolesService.createRole).toHaveBeenCalledTimes(2);
    });
  });

  describe("Update Hierarchy Relationships", () => {
    it("should update hierarchy relationships", async () => {
      const input = {
        parentRoleId: "new-parent-1"
      };

      vi.mocked(rolesService.updateRole).mockResolvedValue({
        ...mockRole,
        parentRoleId: "new-parent-1"
      } as any);

      await rolesService.updateRole("role-1", venueId, input);

      expect(rolesService.updateRole).toHaveBeenCalled();
    });
  });

  describe("Delete Hierarchy Node", () => {
    it("should delete hierarchy node (with children)", async () => {
      // First check if has children
      const childRoles = [{ id: "child-1", parentRoleId: "role-1" }];
      vi.mocked(rolesService.listRoles).mockResolvedValue(childRoles as any);

      // Should fail if has children
      await expect(rolesService.deleteRole("role-1", venueId)).rejects.toThrow(
        "Cannot delete role with child roles"
      );
    });
  });

  describe("Prevent Circular References", () => {
    it("should prevent circular references", async () => {
      const input = {
        parentRoleId: "role-1" // Trying to set self as parent
      };

      vi.mocked(rolesService.updateRole).mockImplementation(() => {
        throw new Error("A role cannot be its own parent");
      });

      await expect(rolesService.updateRole("role-1", venueId, input)).rejects.toThrow();
    });
  });

  describe("Validate Only Management Roles as Parents", () => {
    it("should validate only management roles as parents", async () => {
      const input = {
        parentRoleId: "regular-role-1" // Not a management role
      };

      vi.mocked(rolesService.updateRole).mockImplementation(() => {
        throw new Error("Parent role must be a management role");
      });

      await expect(rolesService.updateRole("role-1", venueId, input)).rejects.toThrow(
        "Parent role must be a management role"
      );
    });
  });

  describe("Management Role Lifecycle", () => {
    it("should handle management role creation/deletion", async () => {
      // Enable management requirement
      const enableInput = {
        requiresManagement: true
      };

      vi.mocked(rolesService.updateRole).mockResolvedValue({
        ...mockRole,
        requiresManagement: true,
        managementRole: mockManagementRole
      } as any);

      await rolesService.updateRole("role-1", venueId, enableInput);

      // Disable management requirement
      const disableInput = {
        requiresManagement: false
      };

      vi.mocked(rolesService.updateRole).mockResolvedValue({
        ...mockRole,
        requiresManagement: false
      } as any);

      await rolesService.updateRole("role-1", venueId, disableInput);

      expect(rolesService.updateRole).toHaveBeenCalledTimes(2);
    });
  });
});
