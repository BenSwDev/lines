"use server";

import { authService } from "../services/authService";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required")
});

export async function registerUser(input: unknown) {
  try {
    const validated = registerSchema.parse(input);

    // Check if user exists
    const existing = await authService.getUserByEmail(validated.email);
    if (existing) {
      return { success: false, error: "User with this email already exists" };
    }

    const user = await authService.createUser(validated);

    return { success: true, data: { id: user.id, email: user.email } };
  } catch (error) {
    console.error("Register error:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    return { success: false, error: "Registration failed" };
  }
}
