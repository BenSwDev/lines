"use server";

import { venueDetailsService } from "../services/venueDetailsService";
import { updateVenueDetailsSchema } from "../schemas/venueDetailsSchemas";
import { revalidatePath } from "next/cache";

export async function updateVenueDetails(venueId: string, input: unknown) {
  try {
    const validated = updateVenueDetailsSchema.parse(input);
    const details = await venueDetailsService.updateVenueDetails(venueId, validated);

    revalidatePath(`/venues/${venueId}/info`);

    return { success: true, data: details };
  } catch (error) {
    console.error("Error updating venue details:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "שגיאה בעדכון פרטי המקום" };
  }
}

