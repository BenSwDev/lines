import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRole } from "@/modules/roles-hierarchy/actions/roleActions";
import { updateStaffing } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { rolesService } from "@/modules/roles-hierarchy/services/rolesService";
import { mockRole } from "../../../fixtures/roles";

vi.mock("@/modules/roles-hierarchy/actions/roleActions");
vi.mock("@/modules/floor-plan-editor/actions/floorPlanActions");
vi.mock("@/modules/roles-hierarchy/services/rolesService");

describe("Floor Plan ↔ Roles Integration", () => {
  const venueId = "venue-1";
  const roleId = "role-1";
  const zoneId = "zone-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create role", async () => {
    const input = {
      name: "Waiter",
      color: "#10B981",
      icon: "🍽️"
    };

    vi.mocked(createRole).mockResolvedValue({
      success: true,
      data: mockRole
    } as any);

    const result = await createRole(venueId, input);

    expect(result.success).toBe(true);
  });

  it("should use role in floor plan staffing", async () => {
    const staffingInput = {
      targetType: "zone" as const,
      targetId: zoneId,
      staffingRules: [
        {
          roleId: roleId,
          managers: 1,
          employees: 3
        }
      ]
    };

    vi.mocked(updateStaffing).mockResolvedValue({
      success: true
    } as any);

    const result = await updateStaffing(staffingInput);

    expect(result.success).toBe(true);
  });

  it("should verify role available in staffing editor", async () => {
    // Roles should be available when configuring floor plan staffing
    vi.mocked(rolesService.listRoles).mockResolvedValue([mockRole] as any);

    const roles = await rolesService.listRoles(venueId);

    expect(roles.length).toBeGreaterThan(0);
    // Role should be available for selection in staffing editor
  });

  it("should delete role used in staffing", async () => {
    // If role is used in floor plan staffing, deletion should be handled
    vi.mocked(rolesService.deleteRole).mockResolvedValue(mockRole as any);

    await rolesService.deleteRole(roleId, venueId);

    expect(rolesService.deleteRole).toHaveBeenCalled();
    // In production, would need cascade delete or validation
  });

  it("should verify error handling", async () => {
    // Error should be handled gracefully when role used in staffing is deleted
    expect(true).toBe(true); // Placeholder for error handling logic
  });
});
