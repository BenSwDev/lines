import { z } from "zod";

/**
 * Common validation utilities and Zod helpers for the Lines app
 */

// Email validation
export const emailSchema = z.string().email("כתובת אימייל לא תקינה");

// Phone validation (flexible for Hebrew formats)
export const phoneSchema = z.string().min(9, "מספר טלפון חייב להכיל לפחות 9 ספרות");

// Time validation (HH:MM format, 00:00-23:59 or 24:00)
export const timeSchema = z.string().regex(
  /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$|^24:00$/,
  "פורמט שעה לא תקין (נדרש HH:MM)"
);

// Date validation (YYYY-MM-DD)
export const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "פורמט תאריך לא תקין (נדרש YYYY-MM-DD)"
);

// Color validation (hex format)
export const colorSchema = z.string().regex(
  /^#[0-9A-Fa-f]{6}$/,
  "צבע חייב להיות בפורמט hex (#RRGGBB)"
);

// Weekday validation (0-6, Sunday to Saturday)
export const weekdaySchema = z.number().int().min(0).max(6);

// Frequency validation
export const frequencySchema = z.enum(["weekly", "monthly", "variable", "oneTime"], {
  errorMap: () => ({ message: "תדירות לא חוקית" }),
});

/**
 * Helper to validate and parse time strings
 */
export function parseTime(time: string): { hours: number; minutes: number } {
  const result = timeSchema.safeParse(time);
  if (!result.success) {
    throw new Error("Invalid time format");
  }

  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Helper to check if an end time represents overnight (next day)
 */
export function isOvernightShift(startTime: string, endTime: string): boolean {
  try {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    // If end is 24:00 or earlier than start, it's overnight
    return endTime === "24:00" || 
           end.hours < start.hours || 
           (end.hours === start.hours && end.minutes <= start.minutes);
  } catch {
    return false;
  }
}

/**
 * Generic validation helper
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation helper that returns errors
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

