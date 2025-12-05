"use server";

import { venuesService } from "../services/venuesService";

export async function getVenue(id: string) {
  try {
    const venue = await venuesService.getVenue(id);

    if (!venue) {
      return { success: false, error: "המקום לא נמצא" };
    }

    return { success: true, data: venue };
  } catch (error) {
    console.error("Error getting venue:", error);
    return { success: false, error: "שגיאה בטעינת המקום" };
  }
}

