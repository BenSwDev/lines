"use server";

import { venueDetailsService } from "../services/venueDetailsService";

export async function getVenueDetails(venueId: string) {
  try {
    const details = await venueDetailsService.getVenueDetails(venueId);
    return { success: true, data: details };
  } catch (error) {
    console.error("Error getting venue details:", error);
    return { success: false, error: "שגיאה בטעינת פרטי המקום" };
  }
}

