import { z } from "zod";

// Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday
const dayOfWeekSchema = z.number().int().min(0).max(6);

// Time format: HH:MM (24-hour)
const timeSchema = z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
  message: "Time must be in HH:MM format (24-hour)"
});

export const reservationSettingsDayScheduleSchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  intervalMinutes: z.number().int().positive().nullable().optional(),
  customerMessage: z.string().max(1000).nullable().optional()
});

export const reservationFormFieldSchema = z.object({
  id: z.string().cuid().optional(),
  fieldType: z.enum(["name", "email", "phone", "date", "time", "number", "text", "textarea", "select", "checkbox", "custom"]),
  fieldKey: z.string().min(1).max(100),
  label: z.string().min(1),
  placeholder: z.string().nullable().optional(),
  isRequired: z.boolean(),
  isEnabled: z.boolean(),
  order: z.number().int().min(0),
  validationRules: z.object({
    minLength: z.number().int().positive().optional(),
    maxLength: z.number().int().positive().optional(),
    pattern: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional()
  }).nullable().optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).nullable().optional()
});

export const reservationFormDesignSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  buttonTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  borderRadius: z.string().optional(),
  fontFamily: z.string().nullable().optional(),
  headerText: z.string().nullable().optional(),
  footerText: z.string().nullable().optional(),
  logoUrl: z.string().url().nullable().optional()
});

export const reservationSettingsSchema = z.object({
  acceptsReservations: z.boolean(),
  allowPersonalLink: z.boolean(),
  requireApproval: z.boolean(),
  manualRegistrationOnly: z.boolean(),
  manageWaitlist: z.boolean(),
  excludedLineIds: z.array(z.string().cuid()),
  daySchedules: z.array(reservationSettingsDayScheduleSchema),
  formFields: z.array(reservationFormFieldSchema).optional(),
  formDesign: reservationFormDesignSchema.optional()
});

export const updateReservationSettingsSchema = reservationSettingsSchema.partial();

// Validation helper: endTime must be after startTime (or equal)
export function validateTimeRange(startTime: string, endTime: string): boolean {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  return endTotal > startTotal;
}
