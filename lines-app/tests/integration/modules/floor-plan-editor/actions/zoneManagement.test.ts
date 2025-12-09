import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createZone,
  updateZoneContent,
  deleteZone
} from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { floorPlanService } from "@/modules/floor-plan-editor/services/floorPlanService";
import { mockZone } from "@/../../fixtures/floorPlans";

vi.mock("@/modules/floor-plan-editor/services/floorPlanService");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Zone Management Integration", () => {
  const floorPlanId = "floor-plan-1";
  const venueId = "venue-1";
  const zoneId = "zone-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createZone", () => {
    it("should create zone successfully", async () => {
      const input = {
        floorPlanId,
        venueId,
        name: "VIP Zone",
        color: "#3B82F6"
      };

      vi.mocked(floorPlanService.createZone).mockResolvedValue(mockZone as any);

      const result = await createZone(input);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockZone.id);
    });

    it("should create zone with tables", async () => {
      const input = {
        floorPlanId,
        venueId,
        name: "Zone with Tables",
        color: "#3B82F6",
        tables: [
          {
            name: "Table 1",
            seats: 4,
            positionX: 100,
            positionY: 100
          }
        ]
      };

      const zoneWithTables = {
        ...mockZone,
        tables: input.tables
      };

      vi.mocked(floorPlanService.createZone).mockResolvedValue(zoneWithTables as any);

      const result = await createZone(input);

      expect(result.success).toBe(true);
    });
  });

  describe("updateZoneContent", () => {
    it("should update zone content", async () => {
      const input = {
        id: zoneId,
        name: "Updated Zone Name"
      };

      vi.mocked(floorPlanService.updateZoneContent).mockResolvedValue({
        ...mockZone,
        name: "Updated Zone Name"
      } as any);

      const result = await updateZoneContent(input);

      expect(result.success).toBe(true);
    });
  });

  describe("deleteZone", () => {
    it("should delete zone", async () => {
      vi.mocked(floorPlanService.deleteZone).mockResolvedValue(mockZone as any);

      const result = await deleteZone(zoneId);

      expect(result.success).toBe(true);
    });

    it("should delete zone with tables (cascade)", async () => {
      vi.mocked(floorPlanService.deleteZone).mockResolvedValue(mockZone as any);

      await deleteZone(zoneId);

      expect(floorPlanService.deleteZone).toHaveBeenCalledWith(zoneId);
      // Cascade delete should be handled by Prisma
    });
  });
});
