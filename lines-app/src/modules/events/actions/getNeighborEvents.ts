"use server";

import { eventsService } from "../services/eventsService";

export async function getNeighborEvents(lineId: string, currentDate: string) {
  try {
    const neighbors = await eventsService.getNeighborEvents(lineId, currentDate);
    return { success: true, data: neighbors };
  } catch (error) {
    console.error("Error getting neighbor events:", error);
    return { success: false, error: "שגיאה בטעינת אירועים סמוכים" };
  }
}

