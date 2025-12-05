"use server";

import { lineRepository } from "@/core/db";
import { createLineSchema } from "../schemas/lineSchemas";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/auth/session";

export async function createLine(venueId: string, input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createLineSchema.parse(input);

    const line = await lineRepository.create({
      venue: { connect: { id: venueId } },
      name: validated.name,
      days: validated.days,
      startTime: validated.startTime,
      endTime: validated.endTime,
      frequency: validated.frequency,
      color: validated.color
    });

    revalidatePath(`/venues/${venueId}/lines`);

    return { success: true, data: line };
  } catch (error) {
    console.error("Error creating line:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "שגיאה ביצירת הליין" };
  }
}
