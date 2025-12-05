"use server";

import { venuesService } from "../services/venuesService";
import { withErrorHandlingNullable } from "@/core/http/errorHandler";

export async function getVenue(id: string) {
  const result = await withErrorHandlingNullable(
    () => venuesService.getVenue(id),
    "Error getting venue"
  );

  if (result.success && !result.data) {
    return { success: false, error: "המקום לא נמצא" };
  }

  return result;
}
