"use server";

import { eventsService } from "../services/eventsService";

export async function getEventDetail(occurrenceId: string) {
  try {
    const event = await eventsService.getEventDetail(occurrenceId);

    if (!event) {
      return { success: false, error: "האירוע לא נמצא" };
    }

    return { success: true, data: event };
  } catch (error) {
    console.error("Error getting event detail:", error);
    return { success: false, error: "שגיאה בטעינת פרטי האירוע" };
  }
}

