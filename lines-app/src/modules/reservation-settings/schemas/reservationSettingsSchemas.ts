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

export const reservationSettingsSchema = z.object({
  acceptsReservations: z.boolean(),
  allowPersonalLink: z.boolean(),
  requireApproval: z.boolean(),
  manualRegistrationOnly: z.boolean(),
  manageWaitlist: z.boolean(),
  excludedLineIds: z.array(z.string().cuid()),
  daySchedules: z.array(reservationSettingsDayScheduleSchema)
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
