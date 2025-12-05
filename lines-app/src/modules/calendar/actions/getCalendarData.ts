"use server";

import { calendarService } from "../services/calendarService";
import { withErrorHandling } from "@/core/http/errorHandler";

export async function getCalendarData(venueId: string) {
  return withErrorHandling(
    () => calendarService.getVenueCalendarData(venueId),
    "Error getting calendar data"
  );
}
