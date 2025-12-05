"use server";

import { lineRepository } from "@/core/db";
import { withErrorHandling } from "@/core/http/errorHandler";

export async function listLines(venueId: string) {
  return withErrorHandling(() => lineRepository.findByVenueId(venueId), "Error listing lines");
}
