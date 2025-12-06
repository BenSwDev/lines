"use server";

import { reservationSettingsService } from "../services/reservationSettingsService";
import type { ReservationSettingsWithRelations, ReservationSettingsInput } from "../types";
import { getCurrentUser } from "@/core/auth/session";
import { prisma } from "@/core/integrations/prisma/client";

/**
 * Get reservation settings for a venue
 */
export async function getReservationSettings(
  venueId: string
): Promise<
  { success: true; data: ReservationSettingsWithRelations } | { success: false; error: string }
> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify venue ownership
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    });

    if (!venue) {
      return { success: false, error: "Venue not found" };
    }

    if (venue.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const settings = await reservationSettingsService.getOrCreate(venueId);
    return { success: true, data: settings };
  } catch (error) {
    console.error("Error getting reservation settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get reservation settings"
    };
  }
}

/**
 * Update reservation settings for a venue
 */
export async function updateReservationSettings(
  venueId: string,
  input: ReservationSettingsInput
): Promise<
  { success: true; data: ReservationSettingsWithRelations } | { success: false; error: string }
> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify venue ownership
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    });

    if (!venue) {
      return { success: false, error: "Venue not found" };
    }

    if (venue.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const settings = await reservationSettingsService.update(venueId, input);
    return { success: true, data: settings };
  } catch (error) {
    console.error("Error updating reservation settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update reservation settings"
    };
  }
}
