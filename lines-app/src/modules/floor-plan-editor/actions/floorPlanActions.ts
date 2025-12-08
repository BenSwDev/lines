"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/core/integrations/prisma";
import { floorPlanService } from "../services/floorPlanService";
import {
  createFloorPlanSchema,
  updateFloorPlanSchema,
  updateZoneContentSchema,
  updateTableContentSchema,
  updateStaffingSchema,
  updateMinimumOrderSchema,
  createZoneSchema,
  createTableSchema,
  createVenueAreaSchema,
  updateFloorPlanLinesSchema,
  updateLineFloorPlanStaffingSchema,
  updateLineFloorPlanMinimumOrderSchema
} from "../schemas/floorPlanSchemas";
import {
  lineFloorPlanStaffingService,
  lineFloorPlanMinimumOrderService
} from "../services/lineFloorPlanService";
import type { FloorPlanWithDetails, FloorPlanListItem } from "../types";

// ============================================================================
// GET ACTIONS
// ============================================================================

/**
 * Get all floor plans for a venue
 */
export async function getFloorPlans(venueId: string): Promise<{
  success: boolean;
  data?: FloorPlanListItem[];
  error?: string;
}> {
  try {
    const floorPlans = await floorPlanService.getFloorPlansByVenue(venueId);
    return { success: true, data: floorPlans };
  } catch (error) {
    console.error("Error getting floor plans:", error);
    return { success: false, error: "Failed to get floor plans" };
  }
}

/**
 * Get a single floor plan with full details
 */
export async function getFloorPlan(id: string): Promise<{
  success: boolean;
  data?: FloorPlanWithDetails;
  error?: string;
}> {
  try {
    const floorPlan = await floorPlanService.getFloorPlanById(id);
    if (!floorPlan) {
      return { success: false, error: "Floor plan not found" };
    }
    return { success: true, data: floorPlan };
  } catch (error) {
    console.error("Error getting floor plan:", error);
    return { success: false, error: "Failed to get floor plan" };
  }
}

/**
 * Get default floor plan for a venue
 */
export async function getDefaultFloorPlan(venueId: string): Promise<{
  success: boolean;
  data?: FloorPlanWithDetails | null;
  error?: string;
}> {
  try {
    const floorPlan = await floorPlanService.getDefaultFloorPlan(venueId);
    return { success: true, data: floorPlan };
  } catch (error) {
    console.error("Error getting default floor plan:", error);
    return { success: false, error: "Failed to get default floor plan" };
  }
}

/**
 * Get all lines for a venue (for floor plan assignment)
 */
export async function getVenueLines(venueId: string): Promise<{
  success: boolean;
  data?: { id: string; name: string; color: string }[];
  error?: string;
}> {
  try {
    const lines = await floorPlanService.getVenueLines(venueId);
    return { success: true, data: lines };
  } catch (error) {
    console.error("Error getting venue lines:", error);
    return { success: false, error: "Failed to get venue lines" };
  }
}

/**
 * Get floor plan statistics
 */
export async function getFloorPlanStats(id: string): Promise<{
  success: boolean;
  data?: {
    totalZones: number;
    totalTables: number;
    totalSeats: number;
    totalAreas: number;
    barCount: number;
  };
  error?: string;
}> {
  try {
    const stats = await floorPlanService.getFloorPlanStats(id);
    if (!stats) {
      return { success: false, error: "Floor plan not found" };
    }
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting floor plan stats:", error);
    return { success: false, error: "Failed to get floor plan stats" };
  }
}

// ============================================================================
// CREATE ACTIONS
// ============================================================================

/**
 * Create a new floor plan
 */
export async function createFloorPlan(input: unknown): Promise<{
  success: boolean;
  data?: { id: string };
  error?: string;
}> {
  try {
    const validated = createFloorPlanSchema.parse(input);
    const floorPlan = await floorPlanService.createFloorPlan(validated);

    revalidatePath(`/venues/${validated.venueId}/settings/structure`);

    return { success: true, data: { id: floorPlan.id } };
  } catch (error) {
    console.error("Error creating floor plan:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create floor plan" };
  }
}

/**
 * Duplicate an existing floor plan
 */
export async function duplicateFloorPlan(
  floorPlanId: string,
  newName: string,
  venueId: string
): Promise<{
  success: boolean;
  data?: { id: string };
  error?: string;
}> {
  try {
    const floorPlan = await floorPlanService.duplicateFloorPlan(floorPlanId, newName);

    revalidatePath(`/venues/${venueId}/settings/structure`);

    return { success: true, data: { id: floorPlan.id } };
  } catch (error) {
    console.error("Error duplicating floor plan:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to duplicate floor plan" };
  }
}

// ============================================================================
// UPDATE ACTIONS
// ============================================================================

/**
 * Update floor plan basic info
 */
export async function updateFloorPlan(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validated = updateFloorPlanSchema.parse(input);
    const { id, ...data } = validated;

    // Prevent unsetting isDefault from a default floor plan
    if (data.isDefault !== undefined) {
      const currentFloorPlan = await floorPlanService.getFloorPlanById(id);

      // Prevent unsetting isDefault from a default floor plan
      if (currentFloorPlan?.isDefault && !data.isDefault) {
        return {
          success: false,
          error: "Cannot unset default status from the default floor plan"
        };
      }
    }

    await floorPlanService.updateFloorPlan(id, data);

    // Get venue ID for revalidation
    const floorPlan = await floorPlanService.getFloorPlanById(id);
    if (floorPlan) {
      revalidatePath(`/venues/${floorPlan.venueId}/settings/structure`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating floor plan:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update floor plan" };
  }
}

/**
 * Update zone content
 */
export async function updateZoneContent(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validated = updateZoneContentSchema.parse(input);
    const { id, ...data } = validated;
    await floorPlanService.updateZoneContent(id, data);
    return { success: true };
  } catch (error) {
    console.error("Error updating zone content:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update zone content" };
  }
}

/**
 * Update table content
 */
export async function updateTableContent(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validated = updateTableContentSchema.parse(input);
    const { id, ...data } = validated;
    await floorPlanService.updateTableContent(id, data);
    return { success: true };
  } catch (error) {
    console.error("Error updating table content:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update table content" };
  }
}

/**
 * Update staffing rules
 */
export async function updateStaffing(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validated = updateStaffingSchema.parse(input);
    const { targetType, targetId, staffingRules } = validated;

    if (targetType === "zone") {
      await floorPlanService.updateZoneStaffing(targetId, staffingRules);
    } else {
      await floorPlanService.updateTableStaffing(targetId, staffingRules);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating staffing:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update staffing" };
  }
}

/**
 * Update minimum order
 */
export async function updateMinimumOrder(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validated = updateMinimumOrderSchema.parse(input);
    const { targetType, targetId, minimumPrice } = validated;

    if (targetType === "zone") {
      await floorPlanService.updateZoneMinimumPrice(targetId, minimumPrice);
    } else {
      await floorPlanService.updateTableMinimumPrice(targetId, minimumPrice);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating minimum order:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update minimum order" };
  }
}

// ============================================================================
// DELETE ACTIONS
// ============================================================================

/**
 * Delete a floor plan
 */
export async function deleteFloorPlan(
  id: string,
  venueId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await floorPlanService.deleteFloorPlan(id);

    revalidatePath(`/venues/${venueId}/settings/structure`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting floor plan:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete floor plan" };
  }
}

// ============================================================================
// STRUCTURE BUILDING ACTIONS (Create, Delete, Update Position)
// ============================================================================

/**
 * Create a new zone
 */
export async function createZone(input: unknown): Promise<{
  success: boolean;
  data?: { id: string };
  error?: string;
}> {
  try {
    const validated = createZoneSchema.parse(input);
    const zone = await floorPlanService.createZone({
      floorPlanId: validated.floorPlanId!,
      venueId: validated.venueId!,
      name: validated.name,
      color: validated.color,
      positionX: validated.positionX,
      positionY: validated.positionY,
      width: validated.width,
      height: validated.height,
      description: validated.description ?? undefined
    });

    // Get floor plan for revalidation
    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id: validated.floorPlanId! },
      select: { venueId: true, id: true }
    });

    if (floorPlan) {
      revalidatePath(`/venues/${floorPlan.venueId}/settings/structure/${floorPlan.id}`);
    }

    return { success: true, data: { id: zone.id } };
  } catch (error) {
    console.error("Error creating zone:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create zone" };
  }
}

/**
 * Create a new table
 */
export async function createTable(input: unknown): Promise<{
  success: boolean;
  data?: { id: string };
  error?: string;
}> {
  try {
    const validated = createTableSchema.parse(input);
    const table = await floorPlanService.createTable({
      zoneId: validated.zoneId!,
      name: validated.name,
      seats: validated.seats ?? undefined,
      positionX: validated.positionX,
      positionY: validated.positionY,
      width: validated.width,
      height: validated.height
    });

    // Get zone for revalidation
    const zone = await prisma.zone.findUnique({
      where: { id: validated.zoneId! },
      include: {
        floorPlan: {
          select: { venueId: true, id: true }
        }
      }
    });

    if (zone?.floorPlan) {
      revalidatePath(`/venues/${zone.floorPlan.venueId}/settings/structure/${zone.floorPlan.id}`);
    }

    return { success: true, data: { id: table.id } };
  } catch (error) {
    console.error("Error creating table:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create table" };
  }
}

/**
 * Create a new venue area
 */
export async function createVenueArea(input: unknown): Promise<{
  success: boolean;
  data?: { id: string };
  error?: string;
}> {
  try {
    const validated = createVenueAreaSchema.parse(input);
    const area = await floorPlanService.createVenueArea({
      floorPlanId: validated.floorPlanId!,
      venueId: validated.venueId!,
      areaType: validated.areaType,
      name: validated.name,
      positionX: validated.positionX,
      positionY: validated.positionY,
      width: validated.width,
      height: validated.height,
      rotation: validated.rotation,
      shape: validated.shape,
      icon: validated.icon,
      color: validated.color
    });

    // Get floor plan for revalidation
    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id: validated.floorPlanId! },
      select: { venueId: true, id: true }
    });

    if (floorPlan) {
      revalidatePath(`/venues/${floorPlan.venueId}/settings/structure/${floorPlan.id}`);
    }

    return { success: true, data: { id: area.id } };
  } catch (error) {
    console.error("Error creating venue area:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create venue area" };
  }
}

/**
 * Delete a zone
 */
export async function deleteZone(zoneId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get zone for revalidation
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        floorPlan: {
          select: { venueId: true, id: true }
        }
      }
    });

    await floorPlanService.deleteZone(zoneId);

    if (zone?.floorPlan) {
      revalidatePath(`/venues/${zone.floorPlan.venueId}/settings/structure/${zone.floorPlan.id}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting zone:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete zone" };
  }
}

/**
 * Delete a table
 */
export async function deleteTable(tableId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get table for revalidation
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        zone: {
          include: {
            floorPlan: {
              select: { venueId: true, id: true }
            }
          }
        }
      }
    });

    await floorPlanService.deleteTable(tableId);

    if (table?.zone?.floorPlan) {
      revalidatePath(
        `/venues/${table.zone.floorPlan.venueId}/settings/structure/${table.zone.floorPlan.id}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting table:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete table" };
  }
}

/**
 * Delete a venue area
 */
export async function deleteVenueArea(areaId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get area for revalidation
    const area = await prisma.venueArea.findUnique({
      where: { id: areaId },
      include: {
        floorPlan: {
          select: { venueId: true, id: true }
        }
      }
    });

    await floorPlanService.deleteVenueArea(areaId);

    if (area?.floorPlan) {
      revalidatePath(`/venues/${area.floorPlan.venueId}/settings/structure/${area.floorPlan.id}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting venue area:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete venue area" };
  }
}

/**
 * Update element position and size (for drag, resize, rotate)
 */
export async function updateElementPosition(input: {
  type: "zone" | "table" | "area";
  id: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  rotation?: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { type, id, ...updates } = input;

    // Filter out undefined values to prevent Prisma errors
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (type === "zone") {
      await prisma.zone.update({
        where: { id },
        data: {
          ...(cleanUpdates.positionX !== undefined && { positionX: cleanUpdates.positionX }),
          ...(cleanUpdates.positionY !== undefined && { positionY: cleanUpdates.positionY }),
          ...(cleanUpdates.width !== undefined && { width: cleanUpdates.width }),
          ...(cleanUpdates.height !== undefined && { height: cleanUpdates.height })
        }
      });
    } else if (type === "table") {
      await prisma.table.update({
        where: { id },
        data: {
          ...(cleanUpdates.positionX !== undefined && { positionX: cleanUpdates.positionX }),
          ...(cleanUpdates.positionY !== undefined && { positionY: cleanUpdates.positionY }),
          ...(cleanUpdates.width !== undefined && { width: cleanUpdates.width }),
          ...(cleanUpdates.height !== undefined && { height: cleanUpdates.height }),
          ...(cleanUpdates.rotation !== undefined && { rotation: cleanUpdates.rotation })
        }
      });
    } else if (type === "area") {
      await prisma.venueArea.update({
        where: { id },
        data: {
          ...(cleanUpdates.positionX !== undefined && { positionX: cleanUpdates.positionX }),
          ...(cleanUpdates.positionY !== undefined && { positionY: cleanUpdates.positionY }),
          ...(cleanUpdates.width !== undefined && { width: cleanUpdates.width }),
          ...(cleanUpdates.height !== undefined && { height: cleanUpdates.height }),
          ...(cleanUpdates.rotation !== undefined && { rotation: cleanUpdates.rotation })
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating element position:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update element position" };
  }
}

// ============================================================================
// LINE LINKING ACTIONS
// ============================================================================

/**
 * Update floor plan lines
 * Each line can only be linked to one floor plan at a time
 */
export async function updateFloorPlanLines(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validated = updateFloorPlanLinesSchema.parse(input);
    await floorPlanService.updateFloorPlanLines(validated.floorPlanId, validated.lineIds);

    // Get venue ID for revalidation
    const floorPlan = await floorPlanService.getFloorPlanById(validated.floorPlanId);
    if (floorPlan) {
      revalidatePath(`/venues/${floorPlan.venueId}/settings/structure`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating floor plan lines:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update floor plan lines" };
  }
}

// ============================================================================
// LINE FLOOR PLAN STAFFING ACTIONS
// ============================================================================

/**
 * Update staffing rules for a line + floor plan combination
 */
export async function updateLineFloorPlanStaffing(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validated = updateLineFloorPlanStaffingSchema.parse(input);
    const { lineId, floorPlanId, targetType, targetId, staffingRules } = validated;

    // Determine zoneId and tableId based on targetType
    let zoneId: string | null = null;
    let tableId: string | null = null;

    if (targetType === "zone" && targetId) {
      zoneId = targetId;
    } else if (targetType === "table" && targetId) {
      // Get table to find its zone
      const table = await prisma.table.findUnique({
        where: { id: targetId },
        select: { zoneId: true }
      });
      if (table) {
        tableId = targetId;
        zoneId = table.zoneId;
      }
    }

    await lineFloorPlanStaffingService.upsertStaffingRules(
      lineId,
      floorPlanId,
      zoneId,
      tableId,
      staffingRules
    );

    // Get floor plan for revalidation
    const floorPlan = await floorPlanService.getFloorPlanById(floorPlanId);
    if (floorPlan) {
      revalidatePath(`/venues/${floorPlan.venueId}/settings/structure/${floorPlanId}`);
      revalidatePath(`/venues/${floorPlan.venueId}/lines`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating line floor plan staffing:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update line floor plan staffing" };
  }
}

// ============================================================================
// LINE FLOOR PLAN MINIMUM ORDER ACTIONS
// ============================================================================

/**
 * Update minimum order for a line + floor plan combination
 */
export async function updateLineFloorPlanMinimumOrder(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const validated = updateLineFloorPlanMinimumOrderSchema.parse(input);
    const { lineId, floorPlanId, targetType, targetId, minimumPrice } = validated;

    // Determine zoneId and tableId based on targetType
    let zoneId: string | null = null;
    let tableId: string | null = null;

    if (targetType === "zone" && targetId) {
      zoneId = targetId;
    } else if (targetType === "table" && targetId) {
      // Get table to find its zone
      const table = await prisma.table.findUnique({
        where: { id: targetId },
        select: { zoneId: true }
      });
      if (table) {
        tableId = targetId;
        zoneId = table.zoneId;
      }
    }

    await lineFloorPlanMinimumOrderService.upsertMinimumOrder(
      lineId,
      floorPlanId,
      zoneId,
      tableId,
      minimumPrice
    );

    // Get floor plan for revalidation
    const floorPlan = await floorPlanService.getFloorPlanById(floorPlanId);
    if (floorPlan) {
      revalidatePath(`/venues/${floorPlan.venueId}/settings/structure/${floorPlanId}`);
      revalidatePath(`/venues/${floorPlan.venueId}/lines`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating line floor plan minimum order:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update line floor plan minimum order" };
  }
}
