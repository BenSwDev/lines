"use server";

import { lineRepository } from "@/core/db";
import { createLineSchema } from "../schemas/lineSchemas";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/auth/session";
import { lineScheduleService } from "../services/lineScheduleService";
import { lineOccurrencesSyncService } from "../services/lineOccurrencesSyncService";
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
    const occurrences: OccurrenceInput[] = [];

    // Add selected dates (from suggestions) - these are expected occurrences
    if (validated.selectedDates && validated.selectedDates.length > 0) {
      for (const date of validated.selectedDates) {
        occurrences.push({
          date,
          isExpected: true,
          isActive: true
        });
      }
    } else if (validated.frequency !== "variable") {
      // If no dates selected but frequency is not variable, generate suggestions automatically
      const suggestions = lineScheduleService.generateSuggestions(
        validated.days,
        validated.frequency as "weekly" | "monthly" | "variable" | "oneTime"
      );
      for (const date of suggestions) {
        occurrences.push({
          date,
          isExpected: true,
          isActive: true
        });
      }
    }

    // Add manual dates - these are NOT expected (manual additions)
    if (validated.manualDates && validated.manualDates.length > 0) {
      for (const date of validated.manualDates) {
        // Skip if already added from selected dates
        if (!occurrences.some((occ) => occ.date === date)) {
          occurrences.push({
            date,
            isExpected: false,
            isActive: true
          });
        }
      }
    }

    // Create occurrences if we have any
    if (occurrences.length > 0) {
      await lineOccurrencesSyncService.syncOccurrences(line, occurrences);
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
