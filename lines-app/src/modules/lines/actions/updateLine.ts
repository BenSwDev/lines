"use server";

import { lineRepository } from "@/core/db";
import { updateLineSchema } from "../schemas/lineSchemas";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/auth/session";
import { lineScheduleService } from "../services/lineScheduleService";
import { lineOccurrencesSyncService } from "../services/lineOccurrencesSyncService";
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

    // If occurrence data provided, sync occurrences
    if (validated.selectedDates !== undefined || validated.manualDates !== undefined) {
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

      // Sync occurrences (this will delete existing and recreate)
      await lineOccurrencesSyncService.syncOccurrences(updatedLine, occurrences);
    } else if (validated.days || validated.frequency || validated.startTime || validated.endTime) {
      // If schedule changed but no occurrence data, regenerate occurrences
      const finalDays = validated.days || updatedLine.days;
      const finalFrequency = (validated.frequency || updatedLine.frequency) as
        | "weekly"
        | "monthly"
        | "variable"
        | "oneTime";

      // Regenerate occurrences based on new schedule
      if (finalFrequency !== "variable") {
        const suggestions = lineScheduleService.generateSuggestions(finalDays, finalFrequency);
        const occurrences: OccurrenceInput[] = suggestions.map((date) => ({
          date,
          isExpected: true,
          isActive: true
        }));

        if (occurrences.length > 0) {
          await lineOccurrencesSyncService.syncOccurrences(updatedLine, occurrences);
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
