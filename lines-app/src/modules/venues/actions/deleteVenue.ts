"use server";

import { venuesService } from "../services/venuesService";
import { getCurrentUser } from "@/core/auth/session";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";

export async function deleteVenue(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await withErrorHandling(
      () => venuesService.deleteVenue(id, user.id!),
      "Error deleting venue"
    );

    if (result.success) {
      revalidatePath("/");
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "errors.deletingVenue" };
  }
}
