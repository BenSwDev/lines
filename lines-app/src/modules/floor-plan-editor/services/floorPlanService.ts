import { prisma } from "@/core/integrations/prisma";
import type {
  FloorPlan,
  FloorPlanWithDetails,
  FloorPlanListItem,
  CreateFloorPlanInput
} from "../types";

// ============================================================================
// FLOOR PLAN SERVICE
// ============================================================================

export const floorPlanService = {
  // --------------------------------------------------------------------------
  // GET OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Get all floor plans for a venue
   */
  async getFloorPlansByVenue(venueId: string): Promise<FloorPlanListItem[]> {
    const floorPlans = await prisma.floorPlan.findMany({
      where: { venueId },
      include: {
        _count: {
          select: {
            zones: true,
            venueAreas: true
          }
        },
        lines: {
          include: {
            line: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });

    return floorPlans as FloorPlanListItem[];
  },

  /**
   * Get a single floor plan with full details
   */
  async getFloorPlanById(id: string): Promise<FloorPlanWithDetails | null> {
    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            tables: {
              orderBy: { tableNumber: "asc" }
            }
          },
          orderBy: { zoneNumber: "asc" }
        },
        venueAreas: true,
        lines: {
          include: {
            line: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        _count: {
          select: {
            zones: true,
            venueAreas: true
          }
        }
      }
    });

    return floorPlan as FloorPlanWithDetails | null;
  },

  /**
   * Get the default floor plan for a venue
   */
  async getDefaultFloorPlan(venueId: string): Promise<FloorPlanWithDetails | null> {
    const floorPlan = await prisma.floorPlan.findFirst({
      where: { venueId, isDefault: true },
      include: {
        zones: {
          include: {
            tables: {
              orderBy: { tableNumber: "asc" }
            }
          },
          orderBy: { zoneNumber: "asc" }
        },
        venueAreas: true,
        lines: {
          include: {
            line: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }
      }
    });

    return floorPlan as FloorPlanWithDetails | null;
  },

  // --------------------------------------------------------------------------
  // CREATE OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Create a new floor plan
   */
  async createFloorPlan(input: CreateFloorPlanInput): Promise<FloorPlan> {
    const { venueId, name, description, isDefault, zones, venueAreas, lineIds } = input;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.floorPlan.updateMany({
        where: { venueId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Create the floor plan with related data
    const floorPlan = await prisma.floorPlan.create({
      data: {
        venue: {
          connect: { id: venueId }
        },
        name,
        description,
        isDefault: isDefault ?? false,
        isLocked: false,
        zones: zones
          ? {
              create: zones.map((zone, zoneIndex) => ({
                venue: {
                  connect: { id: venueId }
                },
                name: zone.name,
                color: zone.color,
                description: zone.description,
                positionX: zone.positionX,
                positionY: zone.positionY,
                width: zone.width,
                height: zone.height,
                shape: zone.shape ?? "rectangle",
                zoneNumber: zone.zoneNumber ?? zoneIndex + 1,
                tables: zone.tables
                  ? {
                      create: zone.tables.map((table, tableIndex) => ({
                        name: table.name,
                        seats: table.seats,
                        positionX: table.positionX,
                        positionY: table.positionY,
                        width: table.width,
                        height: table.height,
                        shape: table.shape ?? "rectangle",
                        tableType: table.tableType ?? "table",
                        tableNumber: table.tableNumber ?? tableIndex + 1
                      }))
                    }
                  : undefined
              }))
            }
          : undefined,
        venueAreas: venueAreas
          ? {
              create: venueAreas.map((area) => ({
                venue: {
                  connect: { id: venueId }
                },
                areaType: area.areaType,
                name: area.name,
                positionX: area.positionX,
                positionY: area.positionY,
                width: area.width,
                height: area.height,
                shape: area.shape ?? "rectangle",
                icon: area.icon,
                color: area.color
              }))
            }
          : undefined,
        lines: lineIds
          ? {
              create: lineIds.map((lineId) => ({
                line: {
                  connect: { id: lineId }
                }
              }))
            }
          : undefined
      }
    });

    return floorPlan;
  },

  /**
   * Duplicate an existing floor plan
   */
  async duplicateFloorPlan(floorPlanId: string, newName: string): Promise<FloorPlan> {
    const original = await this.getFloorPlanById(floorPlanId);
    if (!original) {
      throw new Error("Floor plan not found");
    }

    // Create duplicate with all nested data
    const duplicate = await prisma.floorPlan.create({
      data: {
        venue: {
          connect: { id: original.venueId }
        },
        name: newName,
        description: original.description,
        isDefault: false,
        isLocked: false,
        zones: {
          create: original.zones.map((zone) => ({
            venue: {
              connect: { id: original.venueId }
            },
            name: zone.name,
            color: zone.color,
            description: zone.description,
            positionX: zone.positionX,
            positionY: zone.positionY,
            width: zone.width,
            height: zone.height,
            shape: zone.shape,
            polygonPoints: zone.polygonPoints
              ? JSON.parse(JSON.stringify(zone.polygonPoints))
              : undefined,
            zoneNumber: zone.zoneNumber,
            staffingRules: zone.staffingRules
              ? JSON.parse(JSON.stringify(zone.staffingRules))
              : undefined,
            zoneMinimumPrice: zone.zoneMinimumPrice,
            tables: {
              create: zone.tables.map((table) => ({
                name: table.name,
                seats: table.seats,
                notes: table.notes,
                positionX: table.positionX,
                positionY: table.positionY,
                width: table.width,
                height: table.height,
                rotation: table.rotation,
                shape: table.shape,
                tableType: table.tableType,
                tableNumber: table.tableNumber,
                minimumPrice: table.minimumPrice,
                staffingRules: table.staffingRules
                  ? JSON.parse(JSON.stringify(table.staffingRules))
                  : undefined
              }))
            }
          }))
        },
        venueAreas: {
          create: original.venueAreas.map((area) => ({
            venue: {
              connect: { id: original.venueId }
            },
            areaType: area.areaType,
            name: area.name,
            positionX: area.positionX,
            positionY: area.positionY,
            width: area.width,
            height: area.height,
            rotation: area.rotation,
            shape: area.shape,
            icon: area.icon,
            color: area.color
          }))
        }
      }
    });

    return duplicate;
  },

  // --------------------------------------------------------------------------
  // UPDATE OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Update floor plan basic info
   */
  async updateFloorPlan(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      isDefault?: boolean;
      isLocked?: boolean;
      lineIds?: string[];
    }
  ): Promise<FloorPlan> {
    const { lineIds, ...updateData } = data;

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      const floorPlan = await prisma.floorPlan.findUnique({
        where: { id },
        select: { venueId: true }
      });
      if (floorPlan) {
        await prisma.floorPlan.updateMany({
          where: { venueId: floorPlan.venueId, isDefault: true, NOT: { id } },
          data: { isDefault: false }
        });
      }
    }

    // Update floor plan
    const updated = await prisma.floorPlan.update({
      where: { id },
      data: updateData
    });

    // Update line associations if provided
    if (lineIds !== undefined) {
      // Remove existing associations
      await prisma.floorPlanLine.deleteMany({
        where: { floorPlanId: id }
      });
      // Create new associations
      if (lineIds.length > 0) {
        await prisma.floorPlanLine.createMany({
          data: lineIds.map((lineId) => ({
            floorPlanId: id,
            lineId
          }))
        });
      }
    }

    return updated;
  },

  /**
   * Update zone content (name, number, description)
   */
  async updateZoneContent(
    id: string,
    data: { name?: string; zoneNumber?: number | null; description?: string | null }
  ) {
    return prisma.zone.update({
      where: { id },
      data
    });
  },

  /**
   * Update table content (name, number, seats)
   */
  async updateTableContent(
    id: string,
    data: { name?: string; tableNumber?: number | null; seats?: number | null }
  ) {
    return prisma.table.update({
      where: { id },
      data
    });
  },

  /**
   * Update zone staffing rules
   */
  async updateZoneStaffing(id: string, staffingRules: unknown) {
    return prisma.zone.update({
      where: { id },
      data: { staffingRules: staffingRules as object }
    });
  },

  /**
   * Update table staffing rules
   */
  async updateTableStaffing(id: string, staffingRules: unknown) {
    return prisma.table.update({
      where: { id },
      data: { staffingRules: staffingRules as object }
    });
  },

  /**
   * Update zone minimum price
   */
  async updateZoneMinimumPrice(id: string, minimumPrice: number) {
    return prisma.zone.update({
      where: { id },
      data: { zoneMinimumPrice: minimumPrice }
    });
  },

  /**
   * Update table minimum price
   */
  async updateTableMinimumPrice(id: string, minimumPrice: number) {
    return prisma.table.update({
      where: { id },
      data: { minimumPrice }
    });
  },

  // --------------------------------------------------------------------------
  // DELETE OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Delete a floor plan
   */
  async deleteFloorPlan(id: string): Promise<void> {
    await prisma.floorPlan.delete({
      where: { id }
    });
  },

  // --------------------------------------------------------------------------
  // STATISTICS
  // --------------------------------------------------------------------------

  /**
   * Get floor plan statistics
   */
  async getFloorPlanStats(id: string) {
    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            tables: true
          }
        },
        venueAreas: true
      }
    });

    if (!floorPlan) return null;

    const totalZones = floorPlan.zones.length;
    const totalTables = floorPlan.zones.reduce((acc, zone) => acc + zone.tables.length, 0);
    const totalSeats = floorPlan.zones.reduce(
      (acc, zone) => acc + zone.tables.reduce((t, table) => t + (table.seats ?? 0), 0),
      0
    );
    const totalAreas = floorPlan.venueAreas.length;
    const barCount = floorPlan.venueAreas.filter((a) => a.areaType === "bar").length;

    return {
      totalZones,
      totalTables,
      totalSeats,
      totalAreas,
      barCount
    };
  }
};

export default floorPlanService;
