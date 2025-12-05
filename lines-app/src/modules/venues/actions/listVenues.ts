"use server";

import { venuesService } from "../services/venuesService";

export async function listVenues() {
  try {
    const venues = await venuesService.listVenues();
    return { success: true, data: venues };
  } catch (error) {
    console.error("Error listing venues:", error);
    return { success: false, error: "שגיאה בטעינת המקומות" };
  }
}

