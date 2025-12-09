import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getFloorPlans,
  getFloorPlan,
  getDefaultFloorPlan,
  createFloorPlan,
  updateFloorPlan,
  deleteFloorPlan,
  duplicateFloorPlan
} from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { floorPlanService } from "@/modules/floor-plan-editor/services/floorPlanService";
import { mockFloorPlan } from "../../../../fixtures/floorPlans";

vi.mock("@/modules/floor-plan-editor/services/floorPlanService");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Floor Plan CRUD Integration", () => {
  const venueId = "venue-1";
  const floorPlanId = "floor-plan-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFloorPlans", () => {
    it("should return all floor plans for venue", async () => {
      const mockPlans = [
        { ...mockFloorPlan, _count: { zones: 2, venueAreas: 1 }, lines: [] },
        {
          ...mockFloorPlan,
          id: "floor-plan-2",
          isDefault: false,
          _count: { zones: 1, venueAreas: 0 },
          lines: []
        }
      ];

      vi.mocked(floorPlanService.getFloorPlansByVenue).mockResolvedValue(mockPlans as any);

      const result = await getFloorPlans(venueId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe("getFloorPlan", () => {
    it("should return floor plan with details", async () => {
      const mockPlan = {
        ...mockFloorPlan,
        zones: [],
        venueAreas: [],
        lines: [],
        _count: { zones: 0, venueAreas: 0 }
      };

      vi.mocked(floorPlanService.getFloorPlanById).mockResolvedValue(mockPlan as any);

      const result = await getFloorPlan(floorPlanId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlan);
    });

    it("should return error if not found", async () => {
      vi.mocked(floorPlanService.getFloorPlanById).mockResolvedValue(null);

      const result = await getFloorPlan("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });
  });

  describe("getDefaultFloorPlan", () => {
    it("should return default floor plan", async () => {
      const mockPlan = {
        ...mockFloorPlan,
        isDefault: true,
        zones: [],
        venueAreas: [],
        lines: [],
        _count: { zones: 0, venueAreas: 0 }
      };

      vi.mocked(floorPlanService.getDefaultFloorPlan).mockResolvedValue(mockPlan as any);

      const result = await getDefaultFloorPlan(venueId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlan);
    });

    it("should return null if no default", async () => {
      vi.mocked(floorPlanService.getDefaultFloorPlan).mockResolvedValue(null);

      const result = await getDefaultFloorPlan(venueId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe("createFloorPlan", () => {
    it("should create floor plan successfully", async () => {
      const input = {
        venueId,
        name: "New Floor Plan"
      };

      vi.mocked(floorPlanService.createFloorPlan).mockResolvedValue(mockFloorPlan as any);

      const result = await createFloorPlan(input);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockFloorPlan.id);
    });

    it("should create floor plan as default", async () => {
      const input = {
        venueId,
        name: "Default Floor Plan",
        isDefault: true
      };

      vi.mocked(floorPlanService.createFloorPlan).mockResolvedValue({
        ...mockFloorPlan,
        isDefault: true
      } as any);

      const result = await createFloorPlan(input);

      expect(result.success).toBe(true);
    });
  });

  describe("updateFloorPlan", () => {
    it("should update floor plan", async () => {
      const input = {
        id: floorPlanId,
        name: "Updated Name"
      };

      vi.mocked(floorPlanService.updateFloorPlan).mockResolvedValue({
        ...mockFloorPlan,
        name: "Updated Name"
      } as any);

      const result = await updateFloorPlan(input);

      expect(result.success).toBe(true);
    });
  });

  describe("deleteFloorPlan", () => {
    it("should delete floor plan", async () => {
      vi.mocked(floorPlanService.deleteFloorPlan).mockResolvedValue(mockFloorPlan as any);

      const result = await deleteFloorPlan(floorPlanId, venueId);

      expect(result.success).toBe(true);
    });
  });

  describe("duplicateFloorPlan", () => {
    it("should duplicate floor plan", async () => {
      const newName = "Copied Floor Plan";

      vi.mocked(floorPlanService.duplicateFloorPlan).mockResolvedValue({
        ...mockFloorPlan,
        name: newName
      } as any);

      const result = await duplicateFloorPlan(floorPlanId, newName, venueId);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });
  });
});
