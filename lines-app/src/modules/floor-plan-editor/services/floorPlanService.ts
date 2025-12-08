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
          select: {
            id: true,
            name: true,
            color: true
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
          select: {
            id: true,
            name: true,
            color: true
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
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return floorPlan as FloorPlanWithDetails | null;
  },

  /**
   * Get all lines for a venue (for floor plan assignment)
   */
  async getVenueLines(venueId: string): Promise<{ id: string; name: string; color: string }[]> {
    const lines = await prisma.line.findMany({
      where: { venueId },
      select: {
        id: true,
        name: true,
        color: true
      },
      orderBy: { name: "asc" }
    });
    return lines;
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
          : undefined
      }
    });

    // Link lines to this floor plan (one-to-one: each line can only be linked to one floor plan)
    if (lineIds && lineIds.length > 0) {
      // First, unlink these lines from any other floor plan
      for (const lineId of lineIds) {
        await prisma.line.updateMany({
          where: {
            id: lineId,
            floorPlanId: { not: floorPlan.id }
          },
          data: {
            floorPlanId: null
          }
        });
      }
      // Then link them to this floor plan
      await prisma.line.updateMany({
        where: {
          id: { in: lineIds }
        },
        data: {
          floorPlanId: floorPlan.id
        }
      });
    }

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

    // Get current floor plan to check if it's default
    const currentFloorPlan = await prisma.floorPlan.findUnique({
      where: { id },
      select: { isDefault: true, venueId: true }
    });

    // Prevent unsetting isDefault from a default floor plan
    if (currentFloorPlan?.isDefault && updateData.isDefault === false) {
      throw new Error("Cannot unset default status from the default floor plan");
    }

    // If setting as default, unset other defaults (allow changing default)
    if (updateData.isDefault === true) {
      if (currentFloorPlan) {
        await prisma.floorPlan.updateMany({
          where: { venueId: currentFloorPlan.venueId, isDefault: true, NOT: { id } },
          data: { isDefault: false }
        });
      }
    }

    // Update floor plan
    const updated = await prisma.floorPlan.update({
      where: { id },
      data: updateData
    });

    // Update line associations if provided (one-to-one: each line can only be linked to one floor plan)
    if (lineIds !== undefined) {
      // First, unlink all lines from this floor plan
      await prisma.line.updateMany({
        where: { floorPlanId: id },
        data: { floorPlanId: null }
      });
      // Then, for each line to be linked, unlink it from any other floor plan and link to this one
      if (lineIds.length > 0) {
        for (const lineId of lineIds) {
          await prisma.line.updateMany({
            where: {
              id: lineId,
              floorPlanId: { not: id }
            },
            data: {
              floorPlanId: null
            }
          });
        }
        // Link lines to this floor plan
        await prisma.line.updateMany({
          where: {
            id: { in: lineIds }
          },
          data: {
            floorPlanId: id
          }
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
  // CREATE ZONE/TABLE/AREA OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Create a new zone
   */
  async createZone(input: {
    floorPlanId: string;
    venueId: string;
    name: string;
    color: string;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    description?: string;
  }) {
    return prisma.zone.create({
      data: {
        venue: { connect: { id: input.venueId } },
        floorPlan: { connect: { id: input.floorPlanId } },
        name: input.name,
        color: input.color,
        positionX: input.positionX,
        positionY: input.positionY,
        width: input.width,
        height: input.height,
        description: input.description
      }
    });
  },

  /**
   * Create a new table
   */
  async createTable(input: {
    zoneId: string;
    name: string;
    seats?: number;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    shape?: string;
    tableType?: string;
  }) {
    return prisma.table.create({
      data: {
        zone: { connect: { id: input.zoneId } },
        name: input.name,
        seats: input.seats,
        positionX: input.positionX,
        positionY: input.positionY,
        width: input.width,
        height: input.height,
        shape: input.shape,
        tableType: input.tableType
      }
    });
  },

  /**
   * Create a new venue area
   */
  async createVenueArea(input: {
    floorPlanId: string;
    venueId: string;
    areaType: string;
    name: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    rotation?: number;
    shape?: string;
    icon?: string;
    color?: string;
  }) {
    return prisma.venueArea.create({
      data: {
        venue: { connect: { id: input.venueId } },
        floorPlan: { connect: { id: input.floorPlanId } },
        areaType: input.areaType,
        name: input.name,
        positionX: input.positionX,
        positionY: input.positionY,
        width: input.width,
        height: input.height,
        rotation: input.rotation,
        shape: input.shape,
        icon: input.icon,
        color: input.color
      }
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

  /**
   * Delete a zone
   */
  async deleteZone(id: string): Promise<void> {
    await prisma.zone.delete({
      where: { id }
    });
  },

  /**
   * Delete a table
   */
  async deleteTable(id: string): Promise<void> {
    await prisma.table.delete({
      where: { id }
    });
  },

  /**
   * Delete a venue area
   */
  async deleteVenueArea(id: string): Promise<void> {
    await prisma.venueArea.delete({
      where: { id }
    });
  },

  /**
   * Update floor plan lines (one-to-one: each line can only be linked to one floor plan)
   * When linking a line to a floor plan, it will be automatically unlinked from any other floor plan
   */
  async updateFloorPlanLines(floorPlanId: string, lineIds: string[]): Promise<void> {
    // First, verify the floor plan exists and get venue ID
    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id: floorPlanId },
      select: { venueId: true }
    });

    if (!floorPlan) {
      throw new Error("Floor plan not found");
    }

    // For each line to be linked, first unlink it from any other floor plan
    // This ensures one-to-one relationship (each line can only be linked to one floor plan)
    for (const lineId of lineIds) {
      // Remove this line from all other floor plans by setting floorPlanId to null
      await prisma.line.updateMany({
        where: {
          id: lineId,
          floorPlanId: { not: floorPlanId }
        },
        data: {
          floorPlanId: null
        }
      });
    }

    // Get current lines linked to this floor plan
    const currentLines = await prisma.line.findMany({
      where: { floorPlanId },
      select: { id: true }
    });

    const currentLineIds = new Set(currentLines.map((line) => line.id));
    const newLineIds = new Set(lineIds);

    // Lines to add
    const toAdd = lineIds.filter((id) => !currentLineIds.has(id));
    // Lines to remove
    const toRemove = Array.from(currentLineIds).filter((id) => !newLineIds.has(id));

    // Remove lines that are no longer linked
    if (toRemove.length > 0) {
      await prisma.line.updateMany({
        where: {
          id: { in: toRemove },
          floorPlanId
        },
        data: {
          floorPlanId: null
        }
      });
    }

    // Add new line links
    if (toAdd.length > 0) {
      await prisma.line.updateMany({
        where: {
          id: { in: toAdd }
        },
        data: {
          floorPlanId
        }
      });
    }
  },

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
