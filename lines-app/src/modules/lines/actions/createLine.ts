"use server";

import { lineRepository, lineOccurrenceRepository } from "@/core/db";
import { createLineSchema } from "../schemas/lineSchemas";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/auth/session";
import { lineScheduleService } from "../services/lineScheduleService";
import { lineOccurrencesSyncService } from "../services/lineOccurrencesSyncService";
import { checkMultipleCollisions, type TimeRange } from "@/core/validation";
import type { OccurrenceInput } from "../services/lineOccurrencesSyncService";

export async function createLine(venueId: string, input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createLineSchema.parse(input);

    // Create the Line
    const line = await lineRepository.create({
      venue: { connect: { id: venueId } },
      name: validated.name,
      days: validated.days,
      startTime: validated.startTime,
      endTime: validated.endTime,
      frequency: validated.frequency,
      color: validated.color
    });

    // Generate occurrences based on selected dates and manual dates
    // Use daySchedules if provided, otherwise use legacy fields
    const daySchedules =
      validated.daySchedules ||
      validated.days.map((day) => ({
        day,
        startTime: validated.startTime,
        endTime: validated.endTime,
        frequency: validated.frequency
      }));

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
    } else if (validated.frequency !== "variable") {
      // If no dates selected but frequency is not variable, generate suggestions automatically
      // Get start date from selectedDates if provided, otherwise use today
      const startDate =
        validated.selectedDates && validated.selectedDates.length > 0
          ? new Date(validated.selectedDates[0])
          : new Date();

      // Calculate end of calendar year
      const currentYear = startDate.getFullYear();
      const endOfYear = new Date(currentYear, 11, 31); // December 31
      endOfYear.setHours(23, 59, 59, 999);

      // Calculate months until end of year
      const monthsUntilEndOfYear = 12 - startDate.getMonth();

      // Generate per day schedule
      for (const schedule of daySchedules) {
        const suggestions = lineScheduleService.generateSuggestions(
          [schedule.day],
          schedule.frequency as "weekly" | "monthly" | "variable" | "oneTime",
          startDate,
          monthsUntilEndOfYear
        );
        for (const date of suggestions) {
          const dateObj = new Date(date);
          // Only add if date is within the current year
          if (dateObj <= endOfYear) {
            occurrences.push({
              date,
              isExpected: true,
              isActive: true,
              startTime: schedule.startTime,
              endTime: schedule.endTime
            });
          }
        }
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
        .filter((occ) => occ.isActive)
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

    // Create occurrences if we have any
    if (occurrences.length > 0) {
      await lineOccurrencesSyncService.syncOccurrencesWithSchedules(line, occurrences);
    }

    revalidatePath(`/venues/${venueId}/lines`);
    revalidatePath(`/venues/${venueId}/calendar`);

    return { success: true, data: line };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "שגיאה ביצירת הליין" };
  }
}
