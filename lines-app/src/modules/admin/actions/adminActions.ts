"use server";

import { requireAdmin } from "@/core/auth/session";
import { adminService } from "../services/adminService";
import { updateUserRoleSchema } from "../schemas/adminSchemas";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const users = await adminService.getAllUsers();
    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function getUserById(userId: string) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await adminService.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

export async function updateUserRole(input: unknown) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const validated = updateUserRoleSchema.parse(input);
    
    // Prevent admin from changing their own role
    if (validated.userId === admin.id) {
      return { success: false, error: "Cannot change your own role" };
    }

    const updated = await adminService.updateUserRole(validated.userId, validated.role);
    revalidatePath("/admin");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Prevent admin from deleting themselves
    if (userId === admin.id) {
      return { success: false, error: "Cannot delete yourself" };
    }

    await adminService.deleteUser(userId);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function getAllVenues() {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const venues = await adminService.getAllVenues();
    return { success: true, data: venues };
  } catch (error) {
    console.error("Error fetching venues:", error);
    return { success: false, error: "Failed to fetch venues" };
  }
}

export async function getVenueById(venueId: string) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const venue = await adminService.getVenueById(venueId);
    if (!venue) {
      return { success: false, error: "Venue not found" };
    }
    return { success: true, data: venue };
  } catch (error) {
    console.error("Error fetching venue:", error);
    return { success: false, error: "Failed to fetch venue" };
  }
}

export async function deleteVenue(venueId: string) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await adminService.deleteVenue(venueId);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting venue:", error);
    return { success: false, error: "Failed to delete venue" };
  }
}

export async function getUserStats() {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const stats = await adminService.getUserStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

