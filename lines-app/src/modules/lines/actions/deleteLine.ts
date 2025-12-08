"use server";

import { lineRepository } from "@/core/db";
import { prisma } from "@/core/integrations/prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/auth/session";

export async function deleteLine(venueId: string, lineId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if line exists
    const existingLine = await lineRepository.findById(lineId);
    if (!existingLine) {
      return { success: false, error: "הליין לא נמצא" };
    }

    if (existingLine.venueId !== venueId) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete line (cascade will handle related records)
    await prisma.line.delete({
      where: { id: lineId }
    });

    revalidatePath(`/venues/${venueId}/lines`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting line:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete line" };
  }
}

