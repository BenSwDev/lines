import { z } from "zod";

/**
 * Venue validation schemas
 */

export const createVenueSchema = z.object({
  name: z.string().min(1, "שם המקום הוא שדה חובה").max(100, "שם המקום ארוך מדי")
});

export const updateVenueSchema = z.object({
  name: z.string().min(1, "שם המקום הוא שדה חובה").max(100, "שם המקום ארוך מדי").optional()
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
