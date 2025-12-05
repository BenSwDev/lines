"use server";

import { menusService } from "../services/menusService";
import { createMenuSchema } from "../schemas/menusSchemas";
import { revalidatePath } from "next/cache";

export async function listMenus(venueId: string) {
  try {
    const menus = await menusService.listMenus(venueId);
    return { success: true, data: menus };
  } catch (error) {
    console.error("Error listing menus:", error);
    return { success: false, error: "שגיאה בטעינת התפריטים" };
  }
}

export async function createMenu(venueId: string, input: unknown) {
  try {
    const validated = createMenuSchema.parse(input);
    const menu = await menusService.createMenu(venueId, validated);

    revalidatePath(`/venues/${venueId}/settings`);

    return { success: true, data: menu };
  } catch (error) {
    console.error("Error creating menu:", error);
    return { success: false, error: "שגיאה ביצירת התפריט" };
  }
}

export async function deleteMenu(id: string, venueId: string) {
  try {
    await menusService.deleteMenu(id);
    revalidatePath(`/venues/${venueId}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting menu:", error);
    return { success: false, error: "שגיאה במחיקת התפריט" };
  }
}
