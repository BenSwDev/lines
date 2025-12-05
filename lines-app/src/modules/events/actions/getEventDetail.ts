"use server";

import { eventsService } from "../services/eventsService";
import { withErrorHandlingNullable } from "@/core/http/errorHandler";

export async function getEventDetail(occurrenceId: string) {
  const result = await withErrorHandlingNullable(
    () => eventsService.getEventDetail(occurrenceId),
    "Error getting event detail"
  );

  if (result.success && !result.data) {
    return { success: false, error: "האירוע לא נמצא" };
  }

  return result;
}
