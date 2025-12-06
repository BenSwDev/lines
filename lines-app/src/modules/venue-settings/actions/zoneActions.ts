"use server";

import { zonesService } from "../services/zonesService";
import { createZoneSchema } from "../schemas/zonesSchemas";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";

export async function listZones(venueId: string) {
  return withErrorHandling(() => zonesService.listZones(venueId), "Error listing zones");
}

export async function createZone(venueId: string, input: unknown) {
  try {
    const validated = createZoneSchema.parse(input);

    const result = await withErrorHandling(
      () => zonesService.createZone(venueId, validated),
      "Error creating zone"
    );

    if (result.success) {
      revalidatePath(`/venues/${venueId}/zones`);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "שגיאה ביצירת האזור" };
  }
}
