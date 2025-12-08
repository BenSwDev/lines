"use server";

import { reservationSettingsService } from "../services/reservationSettingsService";
import type { ReservationSettingsWithRelations, ReservationSettingsInput } from "../types";
import { getCurrentUser } from "@/core/auth/session";
import { prisma } from "@/core/integrations/prisma/client";
import { lineRepository } from "@/core/db/repositories/LineRepository";
import { logger } from "@/core/logger";

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
    logger.error("Error getting reservation settings", error);
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
    logger.error("Error updating reservation settings", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update reservation settings"
    };
  }
}

/**
 * Get lines for a venue (for exclusions selection)
 */
export async function getVenueLines(
  venueId: string
): Promise<
  { success: true; data: Array<{ id: string; name: string }> } | { success: false; error: string }
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

    const lines = await lineRepository.findByVenueId(venueId);
    return {
      success: true,
      data: lines.map((line) => ({ id: line.id, name: line.name }))
    };
  } catch (error) {
    logger.error("Error getting venue lines", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get venue lines"
    };
  }
}
