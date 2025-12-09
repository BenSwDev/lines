import { z } from "zod";

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "admin"])
});

export const impersonateUserSchema = z.object({
  userId: z.string().min(1)
});

export const resetPasswordSchema = z.object({
  email: z.string().email()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

