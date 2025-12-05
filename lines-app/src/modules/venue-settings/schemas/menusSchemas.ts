import { z } from "zod";

export const createMenuSchema = z.object({
  name: z.string().min(1, "שם התפריט הוא שדה חובה"),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileData: z.string().optional()
});

export const updateMenuSchema = z.object({
  name: z.string().min(1).optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
  fileData: z.string().optional()
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
