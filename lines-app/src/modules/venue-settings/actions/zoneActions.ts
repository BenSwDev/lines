"use server";

import { zonesService } from "../services/zonesService";
import { createZoneSchema } from "../schemas/zonesSchemas";
import { revalidatePath } from "next/cache";

export async function listZones(venueId: string) {
  try {
    const zones = await zonesService.listZones(venueId);
    return { success: true, data: zones };
  } catch (error) {
    console.error("Error listing zones:", error);
    return { success: false, error: "שגיאה בטעינת האזורים" };
  }
}

export async function createZone(venueId: string, input: unknown) {
  try {
    const validated = createZoneSchema.parse(input);
    const zone = await zonesService.createZone(venueId, validated);

    revalidatePath(`/venues/${venueId}/settings`);

    return { success: true, data: zone };
  } catch (error) {
    console.error("Error creating zone:", error);
    return { success: false, error: "שגיאה ביצירת האזור" };
  }
}

