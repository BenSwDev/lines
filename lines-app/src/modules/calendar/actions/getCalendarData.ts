"use server";

import { calendarService } from "../services/calendarService";

export async function getCalendarData(venueId: string) {
  try {
    const data = await calendarService.getVenueCalendarData(venueId);
    return { success: true, data };
  } catch (error) {
    console.error("Error getting calendar data:", error);
    return { success: false, error: "שגיאה בטעינת לוח השנה" };
  }
}
