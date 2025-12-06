"use server";

import { menusService } from "../services/menusService";
import { createMenuSchema } from "../schemas/menusSchemas";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/core/http/errorHandler";

export async function listMenus(venueId: string) {
  return withErrorHandling(() => menusService.listMenus(venueId), "Error listing menus");
}

export async function createMenu(venueId: string, input: unknown) {
  try {
    const validated = createMenuSchema.parse(input);

    const result = await withErrorHandling(
      () => menusService.createMenu(venueId, validated),
      "Error creating menu"
    );

    if (result.success) {
      revalidatePath(`/venues/${venueId}/menus`);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "שגיאה ביצירת התפריט" };
  }
}

export async function deleteMenu(id: string, venueId: string) {
  const result = await withErrorHandling(() => menusService.deleteMenu(id), "Error deleting menu");

  if (result.success) {
    revalidatePath(`/venues/${venueId}/menus`);
  }

  return result;
}
