"use server";

import { prisma } from "@/core/integrations/prisma/client";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "../../admin/schemas/adminSchemas";
import { z } from "zod";

// For now, this is a mock implementation
// When email service is connected, this will send a real email
export async function requestPasswordReset(input: unknown) {
  try {
    const validated = resetPasswordSchema.parse(input);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    // Always return success (security best practice - don't reveal if email exists)
    if (!user) {
      return {
        success: true,
        message: "If this email exists, a password reset link has been sent"
      };
    }

    // Generate a simple reset token (in production, use crypto.randomBytes)
    // For now, we'll just allow the user to change their password directly
    // In production, you'd:
    // 1. Generate a secure token
    // 2. Store it in database with expiration
    // 3. Send email with reset link
    // 4. User clicks link, enters new password
    // 5. Verify token and update password

    // For mock implementation, we'll return a message that allows password change
    // In production, this would send an email
    return {
      success: true,
      message: "Password reset requested. In production, an email would be sent.",
      // In production, remove this and use email instead
      mockToken: "mock-reset-token-for-development"
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid email address" };
    }
    return { success: false, error: "Failed to process password reset request" };
  }
}

export async function resetPasswordWithToken(input: { token: string; newPassword: string }) {
  try {
    // In production, verify token from database
    // For now, accept any token (mock)
    if (!input.token || input.token !== "mock-reset-token-for-development") {
      return { success: false, error: "Invalid or expired reset token" };
    }

    if (input.newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    // In production, get user ID from token
    // For now, this is a placeholder - you'd need to store token->userId mapping
    return {
      success: false,
      error: "Token-based reset not fully implemented. Use changePassword instead."
    };
  } catch {
    return { success: false, error: "Failed to reset password" };
  }
}

// Allow users to change their password directly (always available)
export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  try {
    const { getCurrentUser } = await import("@/core/auth/session");
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true }
    });

    if (!dbUser || !dbUser.password) {
      return { success: false, error: "User not found or no password set" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(input.currentPassword, dbUser.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Validate new password
    if (input.newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters" };
    }

    // Update password
    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}
