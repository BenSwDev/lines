"use server";

import { venuesService } from "../services/venuesService";
import { createVenueSchema } from "../schemas/venueSchemas";
import { revalidatePath } from "next/cache";

export async function createVenue(input: { name: string }) {
  try {
    const validated = createVenueSchema.parse(input);
    const venue = await venuesService.createVenue(validated.name);
    
    revalidatePath("/");
    
    return { success: true, data: venue };
  } catch (error) {
    console.error("Error creating venue:", error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "שגיאה ביצירת המקום" };
  }
}

