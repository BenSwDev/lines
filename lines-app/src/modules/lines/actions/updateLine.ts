"use server";

import { lineRepository, lineOccurrenceRepository } from "@/core/db";
import { updateLineSchema } from "../schemas/lineSchemas";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/auth/session";
import { lineScheduleService } from "../services/lineScheduleService";
import { lineOccurrencesSyncService } from "../services/lineOccurrencesSyncService";
import { checkMultipleCollisions, type TimeRange } from "@/core/validation";
import type { OccurrenceInput } from "../services/lineOccurrencesSyncService";

export async function updateLine(venueId: string, lineId: string, input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if line exists
    const existingLine = await lineRepository.findById(lineId);
    if (!existingLine) {
      return { success: false, error: "הליין לא נמצא" };
    }

    if (existingLine.venueId !== venueId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateLineSchema.parse(input);

    // Update the Line
    const updatedLine = await lineRepository.update(lineId, {
      ...(validated.name && { name: validated.name }),
      ...(validated.days && { days: validated.days }),
      ...(validated.startTime && { startTime: validated.startTime }),
      ...(validated.endTime && { endTime: validated.endTime }),
      ...(validated.frequency && { frequency: validated.frequency }),
      ...(validated.color && { color: validated.color })
    });

    // Use daySchedules if provided, otherwise use legacy fields
    const daySchedules =
      validated.daySchedules ||
      (validated.days || updatedLine.days).map((day) => ({
        day,
        startTime: validated.startTime || updatedLine.startTime,
        endTime: validated.endTime || updatedLine.endTime,
        frequency: validated.frequency || updatedLine.frequency
      }));

    // If occurrence data provided, sync occurrences
    if (validated.selectedDates !== undefined || validated.manualDates !== undefined) {
      const occurrences: Array<OccurrenceInput & { startTime?: string; endTime?: string }> = [];

      // Add selected dates (from suggestions) - these are expected occurrences
      if (validated.selectedDates && validated.selectedDates.length > 0) {
        for (const date of validated.selectedDates) {
          const dateObj = new Date(date);
          const dayOfWeek = dateObj.getDay();
          const schedule = daySchedules.find((s) => s.day === dayOfWeek);

          occurrences.push({
            date,
            isExpected: true,
            isActive: true,
            startTime: schedule?.startTime,
            endTime: schedule?.endTime
          });
        }
      }

      // Add manual dates - these are NOT expected (manual additions)
      if (validated.manualDates && validated.manualDates.length > 0) {
        for (const date of validated.manualDates) {
          // Skip if already added from selected dates
          if (!occurrences.some((occ) => occ.date === date)) {
            const dateObj = new Date(date);
            const dayOfWeek = dateObj.getDay();
            const schedule = daySchedules.find((s) => s.day === dayOfWeek);

            occurrences.push({
              date,
              isExpected: false,
              isActive: true,
              startTime: schedule?.startTime,
              endTime: schedule?.endTime
            });
          }
        }
      }

      // Check for collisions before creating occurrences
      if (occurrences.length > 0) {
        const existingOccurrences = await lineOccurrenceRepository.findByVenueId(venueId);
        const existingRanges: TimeRange[] = existingOccurrences
          .filter((occ) => occ.isActive && occ.lineId !== lineId) // Exclude current line
          .map((occ) => ({
            date: occ.date,
            startTime: occ.startTime,
            endTime: occ.endTime
          }));

        const newRanges: TimeRange[] = occurrences
          .filter((occ) => occ.startTime && occ.endTime)
          .map((occ) => ({
            date: occ.date,
            startTime: occ.startTime!,
            endTime: occ.endTime!
          }));

        const collisionResult = checkMultipleCollisions(newRanges, existingRanges);

        if (collisionResult.hasCollision) {
          return {
            success: false,
            error: `נמצאו התנגשויות עם ${collisionResult.conflictingRanges.length} אירועים קיימים. לא ניתן ליצור אירועים חופפים באותו זמן.`
          };
        }
      }

      // Sync occurrences (this will delete existing and recreate)
      await lineOccurrencesSyncService.syncOccurrencesWithSchedules(updatedLine, occurrences);
    } else if (
      validated.days ||
      validated.frequency ||
      validated.startTime ||
      validated.endTime ||
      validated.daySchedules
    ) {
      // If schedule changed but no occurrence data, regenerate occurrences
      const finalFrequency = (validated.frequency || updatedLine.frequency) as
        | "weekly"
        | "monthly"
        | "variable"
        | "oneTime";

      // Regenerate occurrences based on new schedule
      if (finalFrequency !== "variable") {
        // Generate per day schedule
        const occurrences: Array<OccurrenceInput & { startTime?: string; endTime?: string }> = [];

        for (const schedule of daySchedules) {
          const suggestions = lineScheduleService.generateSuggestions(
            [schedule.day],
            schedule.frequency as "weekly" | "monthly" | "variable" | "oneTime"
          );
          for (const date of suggestions) {
            occurrences.push({
              date,
              isExpected: true,
              isActive: true,
              startTime: schedule.startTime,
              endTime: schedule.endTime
            });
          }
        }

        if (occurrences.length > 0) {
          // Check for collisions
          const existingOccurrences = await lineOccurrenceRepository.findByVenueId(venueId);
          const existingRanges: TimeRange[] = existingOccurrences
            .filter((occ) => occ.isActive && occ.lineId !== lineId)
            .map((occ) => ({
              date: occ.date,
              startTime: occ.startTime,
              endTime: occ.endTime
            }));

          const newRanges: TimeRange[] = occurrences
            .filter((occ) => occ.startTime && occ.endTime)
            .map((occ) => ({
              date: occ.date,
              startTime: occ.startTime!,
              endTime: occ.endTime!
            }));

          const collisionResult = checkMultipleCollisions(newRanges, existingRanges);

          if (collisionResult.hasCollision) {
            return {
              success: false,
              error: `נמצאו התנגשויות עם ${collisionResult.conflictingRanges.length} אירועים קיימים. לא ניתן ליצור אירועים חופפים באותו זמן.`
            };
          }

          await lineOccurrencesSyncService.syncOccurrencesWithSchedules(updatedLine, occurrences);
        }
      }
    }

    revalidatePath(`/venues/${venueId}/lines`);
    revalidatePath(`/venues/${venueId}/lines/${lineId}`);
    revalidatePath(`/venues/${venueId}/calendar`);

    return { success: true, data: updatedLine };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "שגיאה בעדכון הליין" };
  }
}
