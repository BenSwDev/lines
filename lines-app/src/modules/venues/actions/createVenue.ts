"use server";

import { venuesService } from "../services/venuesService";
import { createVenueSchema } from "../schemas/venueSchemas";
import { getCurrentUser } from "@/core/auth/session";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";

export async function createVenue(input: { name: string }) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createVenueSchema.parse(input);

    const result = await withErrorHandling(
      () => venuesService.createVenue(validated.name, user.id!),
      "Error creating venue"
    );

    if (result.success) {
      revalidatePath("/");
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Error creating venue" };
  }
}
