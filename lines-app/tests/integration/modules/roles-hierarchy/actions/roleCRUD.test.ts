import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getManagementRoles
} from "@/modules/roles-hierarchy/actions/roleActions";
import { rolesService } from "@/modules/roles-hierarchy/services/rolesService";
import { mockRole, mockManagementRole } from "@/../../fixtures/roles";

vi.mock("@/modules/roles-hierarchy/services/rolesService");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Role CRUD Integration", () => {
  const venueId = "venue-1";
  const roleId = "role-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRole", () => {
    it("should create role successfully", async () => {
      const input = {
        name: "Barista",
        color: "#3B82F6",
        icon: "☕"
      };

      vi.mocked(rolesService.createRole).mockResolvedValue(mockRole as any);

      const result = await createRole(venueId, input);

      expect(result.success).toBe(true);
      expect(rolesService.createRole).toHaveBeenCalledWith(venueId, input);
    });

    it("should create role with management requirement", async () => {
      const input = {
        name: "Barista",
        color: "#3B82F6",
        requiresManagement: true
      };

      vi.mocked(rolesService.createRole).mockResolvedValue(mockRole as any);

      const result = await createRole(venueId, input);

      expect(result.success).toBe(true);
    });

    it("should create role with parent role", async () => {
      const input = {
        name: "Barista",
        color: "#3B82F6",
        parentRoleId: "parent-role-1"
      };

      vi.mocked(rolesService.createRole).mockResolvedValue(mockRole as any);

      const result = await createRole(venueId, input);

      expect(result.success).toBe(true);
    });

    it("should create role with manager role", async () => {
      const input = {
        name: "Barista",
        color: "#3B82F6",
        managerRoleId: "manager-role-1"
      };

      vi.mocked(rolesService.createRole).mockResolvedValue(mockRole as any);

      const result = await createRole(venueId, input);

      expect(result.success).toBe(true);
    });
  });

  describe("listRoles", () => {
    it("should list roles for venue", async () => {
      const mockRoles = [mockRole];

      vi.mocked(rolesService.listRoles).mockResolvedValue(mockRoles as any);

      const result = await listRoles(venueId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoles);
    });
  });

  describe("getRole", () => {
    it("should get role by ID", async () => {
      vi.mocked(rolesService.getRole).mockResolvedValue(mockRole as any);

      const result = await getRole(roleId, venueId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRole);
    });
  });

  describe("updateRole", () => {
    it("should update role successfully", async () => {
      const input = {
        name: "Updated Role Name"
      };

      vi.mocked(rolesService.updateRole).mockResolvedValue({ ...mockRole, ...input } as any);

      const result = await updateRole(roleId, venueId, input);

      expect(result.success).toBe(true);
    });

    it("should update role management requirement", async () => {
      const input = {
        requiresManagement: true
      };

      vi.mocked(rolesService.updateRole).mockResolvedValue({
        ...mockRole,
        requiresManagement: true
      } as any);

      const result = await updateRole(roleId, venueId, input);

      expect(result.success).toBe(true);
    });
  });

  describe("deleteRole", () => {
    it("should delete role successfully", async () => {
      vi.mocked(rolesService.deleteRole).mockResolvedValue(mockRole as any);

      const result = await deleteRole(roleId, venueId);

      expect(result.success).toBe(true);
    });
  });

  describe("getManagementRoles", () => {
    it("should get all management roles for venue", async () => {
      const mockManagementRoles = [mockManagementRole];

      vi.mocked(rolesService.getManagementRoles).mockResolvedValue(mockManagementRoles as any);

      const result = await getManagementRoles(venueId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockManagementRoles);
    });
  });
});
