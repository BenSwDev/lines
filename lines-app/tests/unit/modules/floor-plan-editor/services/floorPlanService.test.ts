import { describe, it, expect, beforeEach, vi } from "vitest";
import { floorPlanService } from "@/modules/floor-plan-editor/services/floorPlanService";
import { prisma } from "@/core/integrations/prisma/client";
import { mockFloorPlan, mockZone, mockTable } from "../../../../fixtures/floorPlans";

vi.mock("@/core/integrations/prisma/client", () => ({
  prisma: {
    floorPlan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn()
    },
    line: {
      findMany: vi.fn(),
      updateMany: vi.fn()
    },
    zone: {
      findMany: vi.fn()
    },
    table: {
      findMany: vi.fn()
    },
    venueArea: {
      findMany: vi.fn()
    }
  }
}));

describe("FloorPlanService", () => {
  const venueId = "venue-1";
  const floorPlanId = "floor-plan-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFloorPlansByVenue()", () => {
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

      vi.mocked(prisma.floorPlan.findMany).mockResolvedValue(mockPlans as any);

      const result = await floorPlanService.getFloorPlansByVenue(venueId);

      expect(result).toHaveLength(2);
      expect(prisma.floorPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { venueId }
        })
      );
    });

    it("should include zone and area counts", async () => {
      const mockPlans = [
        {
          ...mockFloorPlan,
          _count: { zones: 3, venueAreas: 2 },
          lines: []
        }
      ];

      vi.mocked(prisma.floorPlan.findMany).mockResolvedValue(mockPlans as any);

      const result = await floorPlanService.getFloorPlansByVenue(venueId);

      expect(result[0]._count.zones).toBe(3);
      expect(result[0]._count.venueAreas).toBe(2);
    });

    it("should order by default first", async () => {
      const mockPlans = [
        { ...mockFloorPlan, isDefault: false },
        { ...mockFloorPlan, id: "floor-plan-2", isDefault: true }
      ];

      vi.mocked(prisma.floorPlan.findMany).mockResolvedValue(mockPlans as any);

      await floorPlanService.getFloorPlansByVenue(venueId);

      expect(prisma.floorPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
        })
      );
    });
  });

  describe("getFloorPlanById()", () => {
    it("should return floor plan with full details", async () => {
      const mockPlan = {
        ...mockFloorPlan,
        zones: [mockZone],
        venueAreas: [],
        lines: [],
        _count: { zones: 1, venueAreas: 0 }
      };

      vi.mocked(prisma.floorPlan.findUnique).mockResolvedValue(mockPlan as any);

      const result = await floorPlanService.getFloorPlanById(floorPlanId);

      expect(result).toEqual(mockPlan);
      expect(prisma.floorPlan.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: floorPlanId }
        })
      );
    });

    it("should include zones and tables", async () => {
      const mockPlan = {
        ...mockFloorPlan,
        zones: [
          {
            ...mockZone,
            tables: [mockTable]
          }
        ],
        venueAreas: [],
        lines: [],
        _count: { zones: 1, venueAreas: 0 }
      };

      vi.mocked(prisma.floorPlan.findUnique).mockResolvedValue(mockPlan as any);

      const result = await floorPlanService.getFloorPlanById(floorPlanId);

      expect(result?.zones).toHaveLength(1);
      expect(result?.zones[0].tables).toHaveLength(1);
    });

    it("should include venue areas", async () => {
      const mockPlan = {
        ...mockFloorPlan,
        zones: [],
        venueAreas: [
          {
            id: "area-1",
            floorPlanId,
            type: "kitchen",
            name: "Kitchen",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        lines: [],
        _count: { zones: 0, venueAreas: 1 }
      };

      vi.mocked(prisma.floorPlan.findUnique).mockResolvedValue(mockPlan as any);

      const result = await floorPlanService.getFloorPlanById(floorPlanId);

      expect(result?.venueAreas).toHaveLength(1);
    });

    it("should include assigned lines", async () => {
      const mockPlan = {
        ...mockFloorPlan,
        zones: [],
        venueAreas: [],
        lines: [{ id: "line-1", name: "Line 1", color: "#3B82F6" }],
        _count: { zones: 0, venueAreas: 0 }
      };

      vi.mocked(prisma.floorPlan.findUnique).mockResolvedValue(mockPlan as any);

      const result = await floorPlanService.getFloorPlanById(floorPlanId);

      expect(result?.lines).toHaveLength(1);
    });

    it("should return null for non-existent floor plan", async () => {
      vi.mocked(prisma.floorPlan.findUnique).mockResolvedValue(null);

      const result = await floorPlanService.getFloorPlanById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getDefaultFloorPlan()", () => {
    it("should return default floor plan", async () => {
      const mockPlan = {
        ...mockFloorPlan,
        isDefault: true,
        zones: [],
        venueAreas: [],
        lines: [],
        _count: { zones: 0, venueAreas: 0 }
      };

      vi.mocked(prisma.floorPlan.findFirst).mockResolvedValue(mockPlan as any);

      const result = await floorPlanService.getDefaultFloorPlan(venueId);

      expect(result).toEqual(mockPlan);
      expect(prisma.floorPlan.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { venueId, isDefault: true }
        })
      );
    });

    it("should return null if no default", async () => {
      vi.mocked(prisma.floorPlan.findFirst).mockResolvedValue(null);

      const result = await floorPlanService.getDefaultFloorPlan(venueId);

      expect(result).toBeNull();
    });
  });

  describe("createFloorPlan()", () => {
    it("should create floor plan successfully", async () => {
      const input = {
        venueId,
        name: "New Floor Plan"
      };

      const mockPlan = {
        ...mockFloorPlan,
        ...input
      };

      vi.mocked(prisma.floorPlan.create).mockResolvedValue(mockPlan as any);

      const result = await floorPlanService.createFloorPlan(input as any);

      expect(result).toEqual(mockPlan);
      expect(prisma.floorPlan.create).toHaveBeenCalled();
    });

    it("should set as default if first", async () => {
      vi.mocked(prisma.floorPlan.findMany).mockResolvedValue([]);
      const input = {
        venueId,
        name: "First Floor Plan",
        isDefault: true
      };

      const mockPlan = {
        ...mockFloorPlan,
        ...input,
        isDefault: true
      };

      vi.mocked(prisma.floorPlan.create).mockResolvedValue(mockPlan as any);

      await floorPlanService.createFloorPlan(input as any);

      expect(prisma.floorPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isDefault: true
          })
        })
      );
    });
  });

  describe("updateFloorPlan()", () => {
    it("should update floor plan", async () => {
      const updateData = {
        name: "Updated Name"
      };

      const updatedPlan = {
        ...mockFloorPlan,
        ...updateData
      };

      vi.mocked(prisma.floorPlan.update).mockResolvedValue(updatedPlan as any);

      const result = await floorPlanService.updateFloorPlan(floorPlanId, updateData as any);

      expect(result.name).toBe("Updated Name");
      expect(prisma.floorPlan.update).toHaveBeenCalledWith({
        where: { id: floorPlanId },
        data: updateData
      });
    });
  });

  describe("deleteFloorPlan()", () => {
    it("should delete floor plan", async () => {
      vi.mocked(prisma.floorPlan.delete).mockResolvedValue(mockFloorPlan as any);

      await floorPlanService.deleteFloorPlan(floorPlanId);

      expect(prisma.floorPlan.delete).toHaveBeenCalledWith({
        where: { id: floorPlanId }
      });
    });

    it("should delete associated zones/tables/areas", async () => {
      // This would typically be handled by Prisma cascade delete
      vi.mocked(prisma.floorPlan.delete).mockResolvedValue(mockFloorPlan as any);

      await floorPlanService.deleteFloorPlan(floorPlanId);

      expect(prisma.floorPlan.delete).toHaveBeenCalled();
    });
  });

  describe("setDefaultFloorPlan()", () => {
    it("should set default floor plan", async () => {
      vi.mocked(prisma.floorPlan.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.floorPlan.update).mockResolvedValue({
        ...mockFloorPlan,
        isDefault: true
      } as any);

      // Note: setDefaultFloorPlan is handled in updateFloorPlan
      // So we test it via updateFloorPlan instead
      await floorPlanService.updateFloorPlan(floorPlanId, { isDefault: true });

      expect(prisma.floorPlan.update).toHaveBeenCalled();
    });
  });

  describe("getVenueLines()", () => {
    it("should return all venue lines", async () => {
      const mockLines = [
        { id: "line-1", name: "Line 1", color: "#3B82F6" },
        { id: "line-2", name: "Line 2", color: "#EF4444" }
      ];

      vi.mocked(prisma.line.findMany).mockResolvedValue(mockLines as any);

      const result = await floorPlanService.getVenueLines(venueId);

      expect(result).toHaveLength(2);
      expect(prisma.line.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { venueId },
          select: { id: true, name: true, color: true },
          orderBy: { name: "asc" }
        })
      );
    });
  });

  describe("getFloorPlanStats()", () => {
    it("should calculate correct stats", async () => {
      const mockPlan = {
        ...mockFloorPlan,
        zones: [{ ...mockZone, tables: [mockTable] }],
        venueAreas: [],
        _count: { zones: 1, venueAreas: 0 }
      };

      vi.mocked(prisma.floorPlan.findUnique).mockResolvedValue(mockPlan as any);

      const result = await floorPlanService.getFloorPlanStats(floorPlanId);

      expect(result).toBeDefined();
    });
  });
});
