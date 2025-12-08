"use server";

import { lineReservationSettingsService } from "../services/lineReservationSettingsService";
import type { LineReservationSettingsInput } from "../schemas/lineReservationSettingsSchemas";
import { getCurrentUser } from "@/core/auth/session";
import { prisma } from "@/core/integrations/prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Get reservation settings for a line
 */
export async function getLineReservationSettings(lineId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify line exists and user owns the venue
    const line = await prisma.line.findUnique({
      where: { id: lineId },
      include: {
        venue: true
      }
    });

    if (!line) {
      return { success: false, error: "Line not found" };
    }

    if (line.venue.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if line is excluded from reservations
    const venueSettings = await prisma.reservationSettings.findUnique({
      where: { venueId: line.venueId },
      include: {
        excludedLines: true
      }
    });

    if (!venueSettings || !venueSettings.acceptsReservations) {
      return { success: false, error: "Reservations are not enabled for this venue" };
    }

    const isExcluded = venueSettings.excludedLines.some((ex) => ex.lineId === lineId);
    if (isExcluded) {
      return { success: false, error: "This line is excluded from reservations" };
    }

    const settings = await lineReservationSettingsService.getOrCreate(lineId);
    return { success: true, data: settings };
  } catch (error) {
    console.error("Error getting line reservation settings", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get line reservation settings"
    };
  }
}

/**
 * Update reservation settings for a line
 */
export async function updateLineReservationSettings(
  lineId: string,
  input: LineReservationSettingsInput
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify line exists and user owns the venue
    const line = await prisma.line.findUnique({
      where: { id: lineId },
      include: {
        venue: true
      }
    });

    if (!line) {
      return { success: false, error: "Line not found" };
    }

    if (line.venue.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if line is excluded from reservations
    const venueSettings = await prisma.reservationSettings.findUnique({
      where: { venueId: line.venueId },
      include: {
        excludedLines: true
      }
    });

    if (!venueSettings || !venueSettings.acceptsReservations) {
      return { success: false, error: "Reservations are not enabled for this venue" };
    }

    const isExcluded = venueSettings.excludedLines.some((ex) => ex.lineId === lineId);
    if (isExcluded) {
      return { success: false, error: "This line is excluded from reservations" };
    }

    const settings = await lineReservationSettingsService.update(lineId, input);

    // Revalidate the line detail page
    revalidatePath(`/venues/${line.venueId}/lines/${lineId}`);

    return { success: true, data: settings };
  } catch (error) {
    console.error("Error updating line reservation settings", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update line reservation settings"
    };
  }
}
