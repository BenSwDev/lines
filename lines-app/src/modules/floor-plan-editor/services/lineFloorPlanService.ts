import { prisma } from "@/core/integrations/prisma";
import type { Prisma } from "@prisma/client";
import type { StaffingRule } from "../types";

// ============================================================================
// LINE FLOOR PLAN STAFFING SERVICE
// ============================================================================

export const lineFloorPlanStaffingService = {
  /**
   * Get staffing rules for a line + floor plan combination
   */
  async getStaffingRules(
    lineId: string,
    floorPlanId: string,
    zoneId?: string | null,
    tableId?: string | null
  ) {
    const staffing = await prisma.lineFloorPlanStaffing.findFirst({
      where: {
        lineId,
        floorPlanId,
        zoneId: zoneId || null,
        tableId: tableId || null
      }
    });

    return staffing?.staffingRules as StaffingRule[] | null;
  },

  /**
   * Update or create staffing rules for a line + floor plan combination
   */
  async upsertStaffingRules(
    lineId: string,
    floorPlanId: string,
    zoneId: string | null,
    tableId: string | null,
    staffingRules: StaffingRule[]
  ) {
    // First try to find existing
    const existing = await prisma.lineFloorPlanStaffing.findFirst({
      where: {
        lineId,
        floorPlanId,
        zoneId: zoneId || null,
        tableId: tableId || null
      }
    });

    if (existing) {
      return prisma.lineFloorPlanStaffing.update({
        where: { id: existing.id },
        data: {
          staffingRules: staffingRules as unknown as Prisma.InputJsonValue
        }
      });
    } else {
      return prisma.lineFloorPlanStaffing.create({
        data: {
          lineId,
          floorPlanId,
          zoneId: zoneId || null,
          tableId: tableId || null,
          staffingRules: staffingRules as unknown as Prisma.InputJsonValue
        }
      });
    }
  },

  /**
   * Delete staffing rules for a line + floor plan combination
   */
  async deleteStaffingRules(
    lineId: string,
    floorPlanId: string,
    zoneId: string | null,
    tableId: string | null
  ) {
    return prisma.lineFloorPlanStaffing.deleteMany({
      where: {
        lineId,
        floorPlanId,
        zoneId: zoneId || null,
        tableId: tableId || null
      }
    });
  }
};

// ============================================================================
// LINE FLOOR PLAN MINIMUM ORDER SERVICE
// ============================================================================

export const lineFloorPlanMinimumOrderService = {
  /**
   * Get minimum order for a line + floor plan combination
   */
  async getMinimumOrder(
    lineId: string,
    floorPlanId: string,
    zoneId?: string | null,
    tableId?: string | null
  ) {
    const minimumOrder = await prisma.lineFloorPlanMinimumOrder.findFirst({
      where: {
        lineId,
        floorPlanId,
        zoneId: zoneId || null,
        tableId: tableId || null
      }
    });

    return minimumOrder?.minimumPrice ? Number(minimumOrder.minimumPrice) : null;
  },

  /**
   * Update or create minimum order for a line + floor plan combination
   */
  async upsertMinimumOrder(
    lineId: string,
    floorPlanId: string,
    zoneId: string | null,
    tableId: string | null,
    minimumPrice: number
  ) {
    // First try to find existing
    const existing = await prisma.lineFloorPlanMinimumOrder.findFirst({
      where: {
        lineId,
        floorPlanId,
        zoneId: zoneId || null,
        tableId: tableId || null
      }
    });

    if (existing) {
      return prisma.lineFloorPlanMinimumOrder.update({
        where: { id: existing.id },
        data: {
          minimumPrice
        }
      });
    } else {
      return prisma.lineFloorPlanMinimumOrder.create({
        data: {
          lineId,
          floorPlanId,
          zoneId: zoneId || null,
          tableId: tableId || null,
          minimumPrice
        }
      });
    }
  },

  /**
   * Delete minimum order for a line + floor plan combination
   */
  async deleteMinimumOrder(
    lineId: string,
    floorPlanId: string,
    zoneId: string | null,
    tableId: string | null
  ) {
    return prisma.lineFloorPlanMinimumOrder.deleteMany({
      where: {
        lineId,
        floorPlanId,
        zoneId: zoneId || null,
        tableId: tableId || null
      }
    });
  }
};
