"use server";

import { venuesService } from "../services/venuesService";
import { createVenueSchema } from "../schemas/venueSchemas";
import { getCurrentUser } from "@/core/auth/session";
import { revalidatePath } from "next/cache";

export async function createVenue(input: { name: string }) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createVenueSchema.parse(input);
    const venue = await venuesService.createVenue(validated.name, user.id);

    revalidatePath("/");

    return { success: true, data: venue };
  } catch (error) {
    console.error("Error creating venue:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Error creating venue" };
  }
}
