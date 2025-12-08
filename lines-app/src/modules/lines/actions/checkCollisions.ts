"use server";

import { lineOccurrenceRepository } from "@/core/db";
import { getCurrentUser } from "@/core/auth/session";
import { checkMultipleCollisions, type TimeRange } from "@/core/validation";

export async function checkLineCollisions(
  venueId: string,
  newRanges: TimeRange[],
  excludeLineId?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get all existing occurrences for this venue
    const existingOccurrences = await lineOccurrenceRepository.findByVenueId(venueId);
    const existingRanges: TimeRange[] = existingOccurrences
      .filter((occ) => {
        if (!occ.isActive) return false;
        if (excludeLineId && occ.lineId === excludeLineId) return false;
        return true;
      })
      .map((occ) => ({
        date: occ.date,
        startTime: occ.startTime,
        endTime: occ.endTime
      }));

    // Check collisions
    const result = checkMultipleCollisions(newRanges, existingRanges);

    if (result.hasCollision) {
      return {
        success: false,
        hasCollision: true,
        conflictingRanges: result.conflictingRanges,
        error: `נמצאו התנגשויות עם ${result.conflictingRanges.length} אירועים קיימים. לא ניתן ליצור אירועים חופפים באותו זמן.`
      };
    }

    return {
      success: true,
      hasCollision: false,
      conflictingRanges: []
    };
  } catch (error) {
    console.error("Error checking collisions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "שגיאה בבדיקת התנגשויות"
    };
  }
}
