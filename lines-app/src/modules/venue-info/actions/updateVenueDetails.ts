"use server";

import { venueDetailsService } from "../services/venueDetailsService";
import { updateVenueDetailsSchema } from "../schemas/venueDetailsSchemas";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";

export async function updateVenueDetails(venueId: string, input: unknown) {
  try {
    const validated = updateVenueDetailsSchema.parse(input);

    const result = await withErrorHandling(
      () => venueDetailsService.updateVenueDetails(venueId, validated),
      "Error updating venue details"
    );

    if (result.success) {
      revalidatePath(`/venues/${venueId}/info`);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "errors.updatingDetails" };
  }
}
