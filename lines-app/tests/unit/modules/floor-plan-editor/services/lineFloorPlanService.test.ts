import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  lineFloorPlanStaffingService,
  lineFloorPlanMinimumOrderService
} from "@/modules/floor-plan-editor/services/lineFloorPlanService";
import { prisma } from "@/core/integrations/prisma/client";

vi.mock("@/core/integrations/prisma/client", () => ({
  prisma: {
    lineFloorPlanStaffing: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn()
    },
    lineFloorPlanMinimumOrder: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn()
    }
  }
}));

describe("LineFloorPlanService", () => {
  const floorPlanId = "floor-plan-1";
  const lineId = "line-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("lineFloorPlanStaffingService", () => {
    it("should create staffing config", async () => {
      const staffingData = {
        lineId,
        floorPlanId,
        zoneId: null,
        tableId: null,
        staffingRules: [
          { roleId: "role-1", managers: 1, employees: 2 },
          { roleId: "role-2", managers: 0, employees: 3 }
        ] as any[]
      };

      const mockStaffing = {
        id: "staffing-1",
        lineId,
        floorPlanId,
        zoneId: null,
        tableId: null,
        staffingRules: staffingData.staffingRules as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.lineFloorPlanStaffing.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.lineFloorPlanStaffing.create).mockResolvedValue(mockStaffing);

      const result = await lineFloorPlanStaffingService.upsertStaffingRules(
        lineId,
        floorPlanId,
        null,
        null,
        staffingData.staffingRules
      );

      expect(result).toEqual(mockStaffing);
      expect(prisma.lineFloorPlanStaffing.create).toHaveBeenCalled();
    });

    it("should update staffing config", async () => {
      const existingStaffing = {
        id: "staffing-1",
        lineId,
        floorPlanId,
        zoneId: null,
        tableId: null,
        staffingRules: [{ roleId: "role-1", managers: 1, employees: 2 }] as any[],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedRules = [
        { roleId: "role-1", managers: 1, employees: 2 },
        { roleId: "role-2", managers: 0, employees: 3 },
        { roleId: "role-3", managers: 1, employees: 1 }
      ] as any[];

      vi.mocked(prisma.lineFloorPlanStaffing.findFirst).mockResolvedValue(existingStaffing);
      vi.mocked(prisma.lineFloorPlanStaffing.update).mockResolvedValue({
        ...existingStaffing,
        staffingRules: updatedRules as any
      });

      const result = await lineFloorPlanStaffingService.upsertStaffingRules(
        lineId,
        floorPlanId,
        null,
        null,
        updatedRules
      );

      expect(result.staffingRules).toHaveLength(3);
    });

    it("should delete staffing config", async () => {
      vi.mocked(prisma.lineFloorPlanStaffing.deleteMany).mockResolvedValue({ count: 1 });

      await lineFloorPlanStaffingService.deleteStaffingRules(lineId, floorPlanId, null, null);

      expect(prisma.lineFloorPlanStaffing.deleteMany).toHaveBeenCalledWith({
        where: {
          lineId,
          floorPlanId,
          zoneId: null,
          tableId: null
        }
      });
    });
  });

  describe("lineFloorPlanMinimumOrderService", () => {
    it("should create minimum order config", async () => {
      const minimumPrice = 100;

      const mockMinOrder = {
        id: "min-order-1",
        lineId,
        floorPlanId,
        zoneId: null,
        tableId: null,
        minimumPrice,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      vi.mocked(prisma.lineFloorPlanMinimumOrder.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.lineFloorPlanMinimumOrder.create).mockResolvedValue(mockMinOrder);

      const result = await lineFloorPlanMinimumOrderService.upsertMinimumOrder(
        lineId,
        floorPlanId,
        null,
        null,
        minimumPrice
      );

      expect(result).toEqual(mockMinOrder);
      expect(prisma.lineFloorPlanMinimumOrder.create).toHaveBeenCalled();
    });

    it("should update minimum order config", async () => {
      const existingMinOrder = {
        id: "min-order-1",
        lineId,
        floorPlanId,
        zoneId: null,
        tableId: null,
        minimumPrice: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedPrice = 150;

      vi.mocked(prisma.lineFloorPlanMinimumOrder.findFirst).mockResolvedValue(existingMinOrder);
      vi.mocked(prisma.lineFloorPlanMinimumOrder.update).mockResolvedValue({
        ...existingMinOrder,
        minimumPrice: updatedPrice
      });

      const result = await lineFloorPlanMinimumOrderService.upsertMinimumOrder(
        lineId,
        floorPlanId,
        null,
        null,
        updatedPrice
      );

      expect(result.minimumPrice).toBe(150);
    });

    it("should delete minimum order config", async () => {
      vi.mocked(prisma.lineFloorPlanMinimumOrder.deleteMany).mockResolvedValue({ count: 1 });

      await lineFloorPlanMinimumOrderService.deleteMinimumOrder(lineId, floorPlanId, null, null);

      expect(prisma.lineFloorPlanMinimumOrder.deleteMany).toHaveBeenCalledWith({
        where: {
          lineId,
          floorPlanId,
          zoneId: null,
          tableId: null
        }
      });
    });
  });
});
