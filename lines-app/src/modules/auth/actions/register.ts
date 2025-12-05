"use server";

import { authService } from "../services/authService";
import { z } from "zod";
import { withErrorHandling } from "@/core/http/errorHandler";
import { registerSchema } from "../schemas/authSchemas";

export async function register(input: unknown) {
  try {
    const validated = registerSchema.parse(input);

    // Check if user exists
    const existing = await authService.getUserByEmail(validated.email);
    if (existing) {
      return {
        success: false,
        error: "User with this email already exists"
      };
    }

    const result = await withErrorHandling(
      () => authService.createUser(validated),
      "Registration error"
    );

    if (!result.success) {
      return result;
    }

    return { success: true, data: { id: result.data.id, email: result.data.email } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return the first error message (which is now a translation key)
      return { success: false, error: error.errors[0].message };
    }

    return { success: false, error: "errors.generic" };
  }
}

export { register as registerUser };
