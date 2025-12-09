import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  updateMinimumOrder,
  updateLineFloorPlanMinimumOrder
} from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { floorPlanService } from "@/modules/floor-plan-editor/services/floorPlanService";

vi.mock("@/modules/floor-plan-editor/services/floorPlanService");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Minimum Order Integration", () => {
  const zoneId = "zone-1";
  const tableId = "table-1";
  const floorPlanId = "floor-plan-1";
  const lineId = "line-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateMinimumOrder", () => {
    it("should update zone minimum order", async () => {
      const input = {
        targetType: "zone" as const,
        targetId: zoneId,
        minimumPrice: 100
      };

      vi.mocked(floorPlanService.updateMinimumOrder).mockResolvedValue({} as any);

      const result = await updateMinimumOrder(input);

      expect(result.success).toBe(true);
    });

    it("should update table minimum order", async () => {
      const input = {
        targetType: "table" as const,
        targetId: tableId,
        minimumPrice: 150
      };

      vi.mocked(floorPlanService.updateMinimumOrder).mockResolvedValue({} as any);

      const result = await updateMinimumOrder(input);

      expect(result.success).toBe(true);
    });
  });

  describe("updateLineFloorPlanMinimumOrder", () => {
    it("should update line-floor plan minimum order", async () => {
      const input = {
        lineId,
        floorPlanId,
        targetType: "zone" as const,
        targetId: zoneId,
        minimumPrice: 200
      };

      vi.mocked(floorPlanService.updateLineFloorPlanMinimumOrder).mockResolvedValue({} as any);

      const result = await updateLineFloorPlanMinimumOrder(input);

      expect(result.success).toBe(true);
    });
  });
});
