"use server";

import { revalidatePath } from "next/cache";
import { floorPlanService } from "../services/floorPlanService";
import {
  createFloorPlanSchema,
  updateFloorPlanSchema,
  updateZoneContentSchema,
  updateTableContentSchema,
  updateStaffingSchema,
  updateMinimumOrderSchema
} from "../schemas/floorPlanSchemas";
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
