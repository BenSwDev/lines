import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  updateStaffing,
  updateLineFloorPlanStaffing
} from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { floorPlanService } from "@/modules/floor-plan-editor/services/floorPlanService";

vi.mock("@/modules/floor-plan-editor/services/floorPlanService");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Staffing Integration", () => {
  const zoneId = "zone-1";
  const tableId = "table-1";
  const floorPlanId = "floor-plan-1";
  const lineId = "line-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateStaffing", () => {
    it("should update zone staffing", async () => {
      const input = {
        targetType: "zone" as const,
        targetId: zoneId,
        staffingRules: [
          {
            roleId: "role-1",
            managers: 1,
            employees: 2
          }
        ]
      };

      vi.mocked(floorPlanService.updateStaffing).mockResolvedValue({} as any);

      const result = await updateStaffing(input);

      expect(result.success).toBe(true);
    });

    it("should update table staffing", async () => {
      const input = {
        targetType: "table" as const,
        targetId: tableId,
        staffingRules: [
          {
            roleId: "role-1",
            managers: 0,
            employees: 1
          }
        ]
      };

      vi.mocked(floorPlanService.updateStaffing).mockResolvedValue({} as any);

      const result = await updateStaffing(input);

      expect(result.success).toBe(true);
    });
  });

  describe("updateLineFloorPlanStaffing", () => {
    it("should update line-floor plan staffing", async () => {
      const input = {
        lineId,
        floorPlanId,
        targetType: "zone" as const,
        targetId: zoneId,
        staffingRules: [
          {
            roleId: "role-1",
            managers: 1,
            employees: 2
          }
        ]
      };

      vi.mocked(floorPlanService.updateLineFloorPlanStaffing).mockResolvedValue({} as any);

      const result = await updateLineFloorPlanStaffing(input);

      expect(result.success).toBe(true);
    });
  });
});
