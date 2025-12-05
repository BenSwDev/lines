"use server";

import { venueDetailsService } from "../services/venueDetailsService";
import { withErrorHandlingNullable } from "@/core/http/errorHandler";

export async function getVenueDetails(venueId: string) {
  return withErrorHandlingNullable(
    () => venueDetailsService.getVenueDetails(venueId),
    "Error getting venue details"
  );
}
