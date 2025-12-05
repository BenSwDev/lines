import { z } from "zod";
import { emailSchema, phoneSchema } from "@/core/validation";

export const updateVenueDetailsSchema = z.object({
  phone: phoneSchema.optional().or(z.literal("")),
  email: emailSchema.optional().or(z.literal("")),
  address: z.string().optional(),
});

export type UpdateVenueDetailsInput = z.infer<typeof updateVenueDetailsSchema>;

