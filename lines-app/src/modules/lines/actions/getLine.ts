"use server";

import { lineRepository } from "@/core/db";
import { withErrorHandlingNullable } from "@/core/http/errorHandler";

export async function getLine(venueId: string, lineId: string) {
  const result = await withErrorHandlingNullable(
    () => lineRepository.findById(lineId),
    "Error getting line"
  );

  if (result.success && !result.data) {
    return { success: false, error: "errors.lineNotFound" };
  }

  if (result.success && result.data && result.data.venueId !== venueId) {
    return { success: false, error: "Unauthorized" };
  }

  return result;
}
