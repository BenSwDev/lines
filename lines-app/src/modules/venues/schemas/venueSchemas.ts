import { z } from "zod";

/**
 * Venue validation schemas
 */

export const createVenueSchema = z.object({
  name: z.string().min(1, "validation.venueNameRequired").max(100, "validation.venueNameMaxLength")
});

export const updateVenueSchema = z.object({
  name: z
    .string()
    .min(1, "validation.venueNameRequired")
    .max(100, "validation.venueNameMaxLength")
    .optional()
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
