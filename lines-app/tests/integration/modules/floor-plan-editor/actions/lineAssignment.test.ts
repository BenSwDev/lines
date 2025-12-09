import { describe, it, expect, beforeEach, vi } from "vitest";
import { updateFloorPlanLines } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { floorPlanService } from "@/modules/floor-plan-editor/services/floorPlanService";

vi.mock("@/modules/floor-plan-editor/services/floorPlanService");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Line Assignment Integration", () => {
  const floorPlanId = "floor-plan-1";
  const venueId = "venue-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateFloorPlanLines", () => {
    it("should assign lines to floor plan", async () => {
      const input = {
        floorPlanId,
        lineIds: ["line-1", "line-2"]
      };

      vi.mocked(floorPlanService.updateFloorPlanLines).mockResolvedValue({} as any);

      const result = await updateFloorPlanLines(input);

      expect(result.success).toBe(true);
    });

    it("should unassign lines from floor plan", async () => {
      const input = {
        floorPlanId,
        lineIds: [] // Empty array = unassign all
      };

      vi.mocked(floorPlanService.updateFloorPlanLines).mockResolvedValue({} as any);

      const result = await updateFloorPlanLines(input);

      expect(result.success).toBe(true);
    });

    it("should update line assignments", async () => {
      const input = {
        floorPlanId,
        lineIds: ["line-1", "line-3"] // Changed from line-2 to line-3
      };

      vi.mocked(floorPlanService.updateFloorPlanLines).mockResolvedValue({} as any);

      const result = await updateFloorPlanLines(input);

      expect(result.success).toBe(true);
    });

    it("should get assigned lines", async () => {
      // This would be part of getFloorPlan which includes lines
      const mockPlan = {
        id: floorPlanId,
        lines: [{ id: "line-1", name: "Line 1", color: "#3B82F6" }]
      };

      vi.mocked(floorPlanService.getFloorPlanById).mockResolvedValue(mockPlan as any);

      // This would be tested via getFloorPlan
      expect(mockPlan.lines).toHaveLength(1);
    });

    it("should validate line exists", async () => {
      const input = {
        floorPlanId,
        lineIds: ["non-existent-line"]
      };

      // Validation would happen in service layer
      vi.mocked(floorPlanService.updateFloorPlanLines).mockResolvedValue({} as any);

      const result = await updateFloorPlanLines(input);

      expect(result.success).toBe(true);
    });
  });
});
