import { z } from "zod";
import { emailSchema, phoneSchema } from "@/core/validation";

export const updateVenueDetailsSchema = z.object({
  phone: phoneSchema.optional().or(z.literal("")),
  email: emailSchema.optional().or(z.literal("")),
  address: z.string().optional(),
  currency: z.enum(["ILS", "USD", "GBP", "EUR"]).optional(),
  weekStartDay: z.number().int().min(0).max(1).optional() // 0 = Sunday, 1 = Monday
});

export type UpdateVenueDetailsInput = z.infer<typeof updateVenueDetailsSchema>;
