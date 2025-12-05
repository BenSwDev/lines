"use server";

import { venuesService } from "../services/venuesService";
import { getCurrentUser } from "@/core/auth/session";

export async function listVenues() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const venues = await venuesService.listUserVenues(user.id);
    return { success: true, data: venues };
  } catch (error) {
    console.error("Error listing venues:", error);
    return { success: false, error: "שגיאה בטעינת המקומות" };
  }
}
