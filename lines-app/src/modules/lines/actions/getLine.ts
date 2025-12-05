"use server";

import { lineRepository } from "@/core/db";

export async function getLine(venueId: string, lineId: string) {
  try {
    const line = await lineRepository.findById(lineId);
    
    if (!line) {
      return { success: false, error: "הליין לא נמצא" };
    }

    if (line.venueId !== venueId) {
      return { success: false, error: "Unauthorized" };
    }

    return { success: true, data: line };
  } catch (error) {
    console.error("Error getting line:", error);
    return { success: false, error: "שגיאה בטעינת הליין" };
  }
}

