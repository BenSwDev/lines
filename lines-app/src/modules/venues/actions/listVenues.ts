"use server";

import { venuesService } from "../services/venuesService";
import { getCurrentUser } from "@/core/auth/session";
import { withErrorHandling } from "@/core/http/errorHandler";

export async function listVenues() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  return withErrorHandling(() => venuesService.listUserVenues(user.id!), "Error listing venues");
}
