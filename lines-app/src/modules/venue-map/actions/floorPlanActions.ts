"use server";

import { prisma } from "@/core/integrations/prisma/client";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";
import { Prisma } from "@prisma/client";
// TableItem type for floor plan
export type TableItem = {
  id: string;
  name: string;
  seats?: number | null;
  notes?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  shape: "rectangle" | "circle" | "triangle" | "square" | "polygon";
  zoneId?: string;
  color?: string;
  polygonPoints?: { x: number; y: number }[];
};

// ZoneItem type for floor plan
export type ZoneItem = {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rectangle" | "circle" | "triangle" | "square" | "polygon";
  polygonPoints?: { x: number; y: number }[];
};

// VenueAreaItem type for floor plan
export type VenueAreaItem = {
  id: string;
  name: string;
  areaType: string; // entrance, exit, kitchen, restroom, etc.
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  shape: "rectangle" | "circle" | "triangle" | "square" | "polygon";
  color?: string;
  icon?: string;
};

/**
 * Load all floor plan elements for a venue (tables, zones, and venue areas) with visual properties
 */
export async function loadVenueFloorPlan(venueId: string) {
  return withErrorHandling(async () => {
    // Load tables
    const tables = await prisma.table.findMany({
      where: {
        zone: {
          venueId
        }
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    });

    // Load zones
    const zones = await prisma.zone.findMany({
      where: { venueId },
      orderBy: { createdAt: "asc" }
    });

    // Load venue areas
    const venueAreas = await prisma.venueArea.findMany({
      where: { venueId },
      orderBy: { createdAt: "asc" }
    });

    // Convert to items format
    const tableItems: TableItem[] = tables.map((table) => ({
      id: table.id,
      name: table.name,
      seats: table.seats,
      notes: table.notes,
      x: table.positionX ? Number(table.positionX) : 0,
      y: table.positionY ? Number(table.positionY) : 0,
      width: table.width ? Number(table.width) : 80,
      height: table.height ? Number(table.height) : 80,
      rotation: table.rotation ? Number(table.rotation) : 0,
      shape: (table.shape as TableItem["shape"]) || "rectangle",
      zoneId: table.zoneId,
      color: table.zone.color
    }));

    const zoneItems: ZoneItem[] = zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      color: zone.color,
      description: zone.description,
      x: zone.positionX ? Number(zone.positionX) : 0,
      y: zone.positionY ? Number(zone.positionY) : 0,
      width: zone.width ? Number(zone.width) : 200,
      height: zone.height ? Number(zone.height) : 200,
      shape: (zone.shape as ZoneItem["shape"]) || "rectangle",
      polygonPoints: zone.polygonPoints ? (zone.polygonPoints as { x: number; y: number }[]) : undefined
    }));

    const venueAreaItems: VenueAreaItem[] = venueAreas.map((area) => ({
      id: area.id,
      name: area.name,
      areaType: area.areaType,
      x: Number(area.positionX),
      y: Number(area.positionY),
      width: Number(area.width),
      height: Number(area.height),
      rotation: area.rotation ? Number(area.rotation) : 0,
      shape: (area.shape as VenueAreaItem["shape"]) || "rectangle",
      color: area.color || undefined,
      icon: area.icon || undefined
    }));

    return {
      tables: tableItems,
      zones: zoneItems,
      venueAreas: venueAreaItems
    };
  }, "Error loading floor plan");
}

/**
 * Load all tables for a venue (across all zones) with visual properties
 * @deprecated Use loadVenueFloorPlan instead
 */
export async function loadVenueTables(venueId: string) {
  const result = await loadVenueFloorPlan(venueId);
  if (result.success && result.data) {
    return { success: true, data: result.data.tables };
  }
  return result;
}

/**
 * Save all floor plan elements (tables, zones, and venue areas) with visual properties
 * Creates/updates/deletes elements as needed
 */
export async function saveVenueFloorPlan(
  venueId: string,
  tables: TableItem[],
  zones: ZoneItem[],
  venueAreas: VenueAreaItem[]
) {
  try {
    // Save zones
    const existingZones = await prisma.zone.findMany({
      where: { venueId },
      select: { id: true }
    });
    const existingZoneIds = new Set(existingZones.map((z) => z.id));
    const newZoneIds = new Set(zones.map((z) => z.id));

    // Delete zones that are no longer in the list
    const zonesToDelete = existingZones.filter((z) => !newZoneIds.has(z.id));
    if (zonesToDelete.length > 0) {
      await prisma.zone.deleteMany({
        where: {
          id: { in: zonesToDelete.map((z) => z.id) }
        }
      });
    }

    // Create or update zones
    for (const zone of zones) {
      if (existingZoneIds.has(zone.id)) {
        await prisma.zone.update({
          where: { id: zone.id },
          data: {
            name: zone.name,
            color: zone.color,
            description: zone.description,
            positionX: zone.x,
            positionY: zone.y,
            width: zone.width,
            height: zone.height,
            shape: zone.shape,
            polygonPoints: zone.polygonPoints ? (zone.polygonPoints as Prisma.InputJsonValue) : Prisma.JsonNull
          }
        });
      } else {
        await prisma.zone.create({
          data: {
            id: zone.id,
            venueId,
            name: zone.name,
            color: zone.color,
            description: zone.description,
            positionX: zone.x,
            positionY: zone.y,
            width: zone.width,
            height: zone.height,
            shape: zone.shape,
            polygonPoints: zone.polygonPoints ? (zone.polygonPoints as Prisma.InputJsonValue) : Prisma.JsonNull
          }
        });
      }
    }

    // Save venue areas
    const existingAreas = await prisma.venueArea.findMany({
      where: { venueId },
      select: { id: true }
    });
    const existingAreaIds = new Set(existingAreas.map((a) => a.id));
    const newAreaIds = new Set(venueAreas.map((a) => a.id));

    // Delete areas that are no longer in the list
    const areasToDelete = existingAreas.filter((a) => !newAreaIds.has(a.id));
    if (areasToDelete.length > 0) {
      await prisma.venueArea.deleteMany({
        where: {
          id: { in: areasToDelete.map((a) => a.id) }
        }
      });
    }

    // Create or update venue areas
    for (const area of venueAreas) {
      if (existingAreaIds.has(area.id)) {
        await prisma.venueArea.update({
          where: { id: area.id },
          data: {
            name: area.name,
            areaType: area.areaType,
            positionX: area.x,
            positionY: area.y,
            width: area.width,
            height: area.height,
            rotation: area.rotation,
            shape: area.shape,
            color: area.color,
            icon: area.icon
          }
        });
      } else {
        await prisma.venueArea.create({
          data: {
            id: area.id,
            venueId,
            name: area.name,
            areaType: area.areaType,
            positionX: area.x,
            positionY: area.y,
            width: area.width,
            height: area.height,
            rotation: area.rotation,
            shape: area.shape,
            color: area.color,
            icon: area.icon
          }
        });
      }
    }

    // Save tables (existing logic)
    const existingTables = await prisma.table.findMany({
      where: {
        zone: {
          venueId
        }
      },
      select: {
        id: true
      }
    });

    const existingTableIds = new Set(existingTables.map((t) => t.id));
    const newTableIds = new Set(tables.map((t) => t.id));

    // Delete tables that are no longer in the list
    const toDelete = existingTables.filter((t) => !newTableIds.has(t.id));
    if (toDelete.length > 0) {
      await prisma.table.deleteMany({
        where: {
          id: {
            in: toDelete.map((t) => t.id)
          }
        }
      });
    }

    // Create or update tables
    for (const table of tables) {
      if (existingTableIds.has(table.id)) {
        // Update existing table
        await prisma.table.update({
          where: { id: table.id },
          data: {
            name: table.name,
            seats: table.seats,
            notes: table.notes,
            positionX: table.x,
            positionY: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            shape: table.shape
          }
        });
      } else {
        // Create new table - need a zoneId
        // If no zoneId, create a default zone or use first zone
        if (!table.zoneId) {
          // Find or create a default zone
          let defaultZone = await prisma.zone.findFirst({
            where: { venueId },
            orderBy: { createdAt: "asc" }
          });

          if (!defaultZone) {
            defaultZone = await prisma.zone.create({
              data: {
                venueId,
                name: "אזור ראשי",
                color: "#3B82F6"
              }
            });
          }

          table.zoneId = defaultZone.id;
        }

        await prisma.table.create({
          data: {
            id: table.id,
            zoneId: table.zoneId,
            name: table.name,
            seats: table.seats,
            notes: table.notes,
            positionX: table.x,
            positionY: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            shape: table.shape
          }
        });
      }
    }

    revalidatePath(`/venues/${venueId}/map`);
    return {
      success: true,
      data: {
        tablesCount: tables.length,
        zonesCount: zones.length,
        areasCount: venueAreas.length
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "errors.savingData" };
  }
}

/**
 * Save tables with visual properties
 * Creates/updates/deletes tables as needed
 * @deprecated Use saveVenueFloorPlan instead
 */
export async function saveVenueTables(venueId: string, tables: TableItem[]) {
  try {
    // Get all existing tables for this venue
    const existingTables = await prisma.table.findMany({
      where: {
        zone: {
          venueId
        }
      },
      select: {
        id: true
      }
    });

    const existingIds = new Set(existingTables.map((t) => t.id));
    const newIds = new Set(tables.map((t) => t.id));

    // Delete tables that are no longer in the list
    const toDelete = existingTables.filter((t) => !newIds.has(t.id));
    if (toDelete.length > 0) {
      await prisma.table.deleteMany({
        where: {
          id: {
            in: toDelete.map((t) => t.id)
          }
        }
      });
    }

    // Create or update tables
    for (const table of tables) {
      if (existingIds.has(table.id)) {
        // Update existing table
        await prisma.table.update({
          where: { id: table.id },
          data: {
            name: table.name,
            seats: table.seats,
            notes: table.notes,
            positionX: table.x,
            positionY: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            shape: table.shape
          }
        });
      } else {
        // Create new table - need a zoneId
        // If no zoneId, create a default zone or use first zone
        if (!table.zoneId) {
          // Find or create a default zone
          let defaultZone = await prisma.zone.findFirst({
            where: { venueId },
            orderBy: { createdAt: "asc" }
          });

          if (!defaultZone) {
            defaultZone = await prisma.zone.create({
              data: {
                venueId,
                name: "אזור ראשי",
                color: "#3B82F6"
              }
            });
          }

          table.zoneId = defaultZone.id;
        }

        await prisma.table.create({
          data: {
            id: table.id,
            zoneId: table.zoneId,
            name: table.name,
            seats: table.seats,
            notes: table.notes,
            positionX: table.x,
            positionY: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            shape: table.shape
          }
        });
      }
    }

    revalidatePath(`/venues/${venueId}/map`);
    return { success: true, data: { count: tables.length } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "errors.savingData" };
  }
}
