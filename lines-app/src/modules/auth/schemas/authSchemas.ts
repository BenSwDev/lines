import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("validation.emailInvalid"),
  password: z.string().min(6, "validation.passwordMinLength"),
  name: z.string().min(1, "validation.nameRequired")
});

export const loginSchema = z.object({
  email: z.string().email("validation.emailInvalid"),
  password: z.string().min(6, "validation.passwordMinLength")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
