"use server";

import { prisma } from "@/core/integrations/prisma/client";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";
import type { TableItem } from "../ui/FloorPlanEditor";

/**
 * Load all tables for a venue (across all zones) with visual properties
 */
export async function loadVenueTables(venueId: string) {
  return withErrorHandling(async () => {
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

    // Convert to TableItem format
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

    return tableItems;
  }, "Error loading tables");
}

/**
 * Save tables with visual properties
 * Creates/updates/deletes tables as needed
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

    revalidatePath(`/venues/${venueId}/settings/zones`);
    return { success: true, data: { count: tables.length } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "errors.savingData" };
  }
}
