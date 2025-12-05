"use server";

import { lineRepository } from "@/core/db";

export async function listLines(venueId: string) {
  try {
    const lines = await lineRepository.findByVenueId(venueId);
    return { success: true, data: lines };
  } catch (error) {
    console.error("Error listing lines:", error);
    return { success: false, error: "שגיאה בטעינת הליינים" };
  }
}
