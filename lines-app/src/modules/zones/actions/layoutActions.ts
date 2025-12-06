"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/core/integrations/prisma/client";
import { withErrorHandling } from "@/core/http/errorHandler";
import { venueAreaRepository } from "@/core/db";
import type { Prisma } from "@prisma/client";
import type { VenueLayout } from "../types";

/**
 * Load venue layout from database
 */
export async function loadVenueLayout(venueId: string) {
  return withErrorHandling(async () => {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        zones: {
          include: {
            tables: true
          }
        }
      }
    });

    if (!venue) {
      return { success: false, error: "Venue not found" };
    }

    // Convert database models to visual layout
    const layout: VenueLayout = {
      layoutData: (venue.layoutData as unknown as VenueLayout["layoutData"]) || {
        width: 1200,
        height: 800,
        scale: 1,
        gridSize: 20,
        showGrid: true,
        backgroundColor: "#f8f9fa"
      },
      zones: venue.zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        color: zone.color,
        description: zone.description || undefined,
        position: {
          x: zone.positionX ? Number(zone.positionX) : 0,
          y: zone.positionY ? Number(zone.positionY) : 0
        },
        dimensions: {
          width: zone.width ? Number(zone.width) : 200,
          height: zone.height ? Number(zone.height) : 150
        },
        rotation: 0,
        shape: (zone.shape as VenueLayout["zones"][0]["shape"]) || "rectangle",
        polygonPoints: zone.polygonPoints
          ? (zone.polygonPoints as { x: number; y: number }[])
          : undefined
      })),
      tables: venue.zones.flatMap((zone) =>
        zone.tables.map((table) => ({
          id: table.id,
          name: table.name,
          seats: table.seats || undefined,
          notes: table.notes || undefined,
          position: {
            x: table.positionX ? Number(table.positionX) : 0,
            y: table.positionY ? Number(table.positionY) : 0
          },
          dimensions: {
            width: table.width ? Number(table.width) : 80,
            height: table.height ? Number(table.height) : 80
          },
          rotation: table.rotation ? Number(table.rotation) : 0,
          shape: (table.shape as VenueLayout["tables"][0]["shape"]) || "rectangle",
          tableType: (table.tableType as VenueLayout["tables"][0]["tableType"]) || "table",
          zoneId: zone.id
        }))
      ),
      areas: (
        await prisma.venueArea.findMany({
          where: { venueId }
        })
      ).map((area) => ({
        id: area.id,
        name: area.name,
        areaType: area.areaType as VenueLayout["areas"][0]["areaType"],
        position: {
          x: Number(area.positionX),
          y: Number(area.positionY)
        },
        dimensions: {
          width: Number(area.width),
          height: Number(area.height)
        },
        rotation: area.rotation ? Number(area.rotation) : 0,
        shape: (area.shape as VenueLayout["areas"][0]["shape"]) || "rectangle",
        icon: area.icon || undefined,
        color: area.color || undefined
      }))
    };

    return { success: true, data: layout };
  }, "Error loading venue layout");
}

/**
 * Save venue layout to database
 */
export async function saveVenueLayout(venueId: string, layout: VenueLayout) {
  return withErrorHandling(async () => {
    // Update venue layout data
    await prisma.venue.update({
      where: { id: venueId },
      data: {
        layoutData: layout.layoutData as unknown as Prisma.InputJsonValue
      }
    });

    // Update zones with visual properties
    for (const zone of layout.zones) {
      await prisma.zone.update({
        where: { id: zone.id },
        data: {
          positionX: zone.position.x,
          positionY: zone.position.y,
          width: zone.dimensions.width,
          height: zone.dimensions.height,
          shape: zone.shape,
          polygonPoints: zone.polygonPoints
            ? (zone.polygonPoints as unknown as Prisma.InputJsonValue)
            : undefined
        }
      });
    }

    // Update tables with visual properties
    for (const table of layout.tables) {
      await prisma.table.update({
        where: { id: table.id },
        data: {
          positionX: table.position.x,
          positionY: table.position.y,
          width: table.dimensions.width,
          height: table.dimensions.height,
          rotation: table.rotation || 0,
          shape: table.shape,
          tableType: table.tableType
        }
      });
    }

    // Delete existing areas and recreate
    await venueAreaRepository.deleteByVenueId(venueId);

    // Save venue areas
    for (const area of layout.areas) {
      await venueAreaRepository.create({
        venue: { connect: { id: venueId } },
        areaType: area.areaType,
        name: area.name,
        positionX: area.position.x,
        positionY: area.position.y,
        width: area.dimensions.width,
        height: area.dimensions.height,
        rotation: area.rotation || 0,
        shape: area.shape || "rectangle",
        icon: area.icon || null,
        color: area.color || null
      });
    }

    revalidatePath(`/venues/${venueId}/zones`);

    return { success: true };
  }, "Error saving venue layout");
}

/**
 * Generate zones and tables from visual layout
 * This creates the actual Zone and Table records in the database
 */
export async function generateZonesFromLayout(venueId: string, layout: VenueLayout) {
  return withErrorHandling(async () => {
    // Delete existing zones (cascades to tables)
    await prisma.zone.deleteMany({
      where: { venueId }
    });

    // Create zones
    for (const zoneVisual of layout.zones) {
      const zone = await prisma.zone.create({
        data: {
          venueId,
          name: zoneVisual.name,
          color: zoneVisual.color,
          description: zoneVisual.description || null,
          positionX: zoneVisual.position.x,
          positionY: zoneVisual.position.y,
          width: zoneVisual.dimensions.width,
          height: zoneVisual.dimensions.height,
          shape: zoneVisual.shape,
          polygonPoints: zoneVisual.polygonPoints
            ? (zoneVisual.polygonPoints as unknown as Prisma.InputJsonValue)
            : undefined
        }
      });

      // Create tables for this zone
      const zoneTables = layout.tables.filter((t) => t.zoneId === zoneVisual.id);
      for (const tableVisual of zoneTables) {
        await prisma.table.create({
          data: {
            zoneId: zone.id,
            name: tableVisual.name,
            seats: tableVisual.seats || null,
            notes: tableVisual.notes || null,
            positionX: tableVisual.position.x,
            positionY: tableVisual.position.y,
            width: tableVisual.dimensions.width,
            height: tableVisual.dimensions.height,
            rotation: tableVisual.rotation || 0,
            shape: tableVisual.shape,
            tableType: tableVisual.tableType
          }
        });
      }
    }

    // Delete existing areas
    await venueAreaRepository.deleteByVenueId(venueId);

    // Create venue areas
    for (const areaVisual of layout.areas) {
      await venueAreaRepository.create({
        venue: { connect: { id: venueId } },
        areaType: areaVisual.areaType,
        name: areaVisual.name,
        positionX: areaVisual.position.x,
        positionY: areaVisual.position.y,
        width: areaVisual.dimensions.width,
        height: areaVisual.dimensions.height,
        rotation: areaVisual.rotation || 0,
        shape: areaVisual.shape || "rectangle",
        icon: areaVisual.icon || null,
        color: areaVisual.color || null
      });
    }

    revalidatePath(`/venues/${venueId}/zones`);

    return { success: true };
  }, "Error generating zones from layout");
}
