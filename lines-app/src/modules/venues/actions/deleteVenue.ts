"use server";

import { venuesService } from "../services/venuesService";
import { getCurrentUser } from "@/core/auth/session";
import { revalidatePath } from "next/cache";

export async function deleteVenue(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const venue = await venuesService.deleteVenue(id, user.id);

    revalidatePath("/");

    return { success: true, data: venue };
  } catch (error) {
    console.error("Error deleting venue:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "שגיאה במחיקת המקום" };
  }
}
