import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createVenueArea,
  deleteVenueArea
} from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { floorPlanService } from "@/modules/floor-plan-editor/services/floorPlanService";
import { mockVenueArea } from "../../../../fixtures/floorPlans";

vi.mock("@/modules/floor-plan-editor/services/floorPlanService");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Venue Area Management Integration", () => {
  const floorPlanId = "floor-plan-1";
  const venueId = "venue-1";
  const areaId = "area-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createVenueArea", () => {
    it("should create venue area successfully", async () => {
      const input = {
        floorPlanId,
        venueId,
        areaType: "kitchen",
        name: "Kitchen",
        positionX: 0,
        positionY: 0,
        width: 100,
        height: 100
      };

      vi.mocked(floorPlanService.createVenueArea).mockResolvedValue(mockVenueArea as any);

      const result = await createVenueArea(input);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockVenueArea.id);
    });
  });

  describe("deleteVenueArea", () => {
    it("should delete venue area", async () => {
      vi.mocked(floorPlanService.deleteVenueArea).mockResolvedValue(mockVenueArea as any);

      const result = await deleteVenueArea(areaId);

      expect(result.success).toBe(true);
    });
  });
});
