"use server";

import { requireAdmin } from "@/core/auth/session";
import { impersonateUserSchema } from "../schemas/adminSchemas";
import { prisma } from "@/core/integrations/prisma/client";
import { auth } from "@/core/auth/auth";

export async function startImpersonation(input: unknown) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const validated = impersonateUserSchema.parse(input);
    
    // Prevent impersonating yourself
    if (validated.userId === admin.id) {
      return { success: false, error: "Cannot impersonate yourself" };
    }

    // Get the user to impersonate
    const targetUser = await prisma.user.findUnique({
      where: { id: validated.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    // Return impersonation data (will be stored in session)
    return {
      success: true,
      data: {
        originalUserId: admin.id,
        originalUserEmail: admin.email,
        originalUserName: admin.name,
        impersonatedUserId: targetUser.id,
        impersonatedUserEmail: targetUser.email,
        impersonatedUserName: targetUser.name
      }
    };
  } catch (error) {
    console.error("Error starting impersonation:", error);
    return { success: false, error: "Failed to start impersonation" };
  }
}

export async function stopImpersonation() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if impersonating (this will be checked in the session)
  // For now, just return success - the actual logic will be in the auth callback
  return { success: true };
}

