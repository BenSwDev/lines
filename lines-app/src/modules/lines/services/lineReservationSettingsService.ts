import { lineReservationSettingsRepository } from "@/core/db/repositories/LineReservationSettingsRepository";
import type { LineReservationSettingsInput } from "../schemas/lineReservationSettingsSchemas";
import { lineReservationSettingsSchema } from "../schemas/lineReservationSettingsSchemas";
import { prisma } from "@/core/integrations/prisma/client";

export class LineReservationSettingsService {
  /**
   * Get reservation settings for a line, creating default if not exists
   */
  async getOrCreate(lineId: string) {
    return lineReservationSettingsRepository.getOrCreate(lineId);
  }

  /**
   * Update reservation settings for a line
   */
  async update(lineId: string, input: LineReservationSettingsInput) {
    // Validate input
    const validated = lineReservationSettingsSchema.parse(input);

    // Verify line exists
    const line = await prisma.line.findUnique({
      where: { id: lineId }
    });

    if (!line) {
      throw new Error("Line not found");
    }

    // Use transaction to update settings and related data
    const result = await prisma.$transaction(async (tx) => {
      // Get or create settings
      let settings = await tx.lineReservationSettings.findUnique({
        where: { lineId }
      });

      if (!settings) {
        settings = await tx.lineReservationSettings.create({
          data: {
            lineId,
            allowPersonalLink: validated.allowPersonalLink,
            requireApproval: validated.requireApproval,
            manageWaitlist: validated.manageWaitlist
          }
        });
      } else {
        settings = await tx.lineReservationSettings.update({
          where: { id: settings.id },
          data: {
            allowPersonalLink: validated.allowPersonalLink,
            requireApproval: validated.requireApproval,
            manageWaitlist: validated.manageWaitlist
          }
        });
      }

      // Update day schedules
      await tx.lineReservationDaySchedule.deleteMany({
        where: { lineReservationSettingsId: settings.id }
      });

      if (validated.daySchedules && validated.daySchedules.length > 0) {
        await tx.lineReservationDaySchedule.createMany({
          data: validated.daySchedules.map((schedule) => ({
            lineReservationSettingsId: settings.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            intervalMinutes: schedule.intervalMinutes ?? null,
            customerMessage: schedule.customerMessage ?? null
          }))
        });
      }

      // Return updated settings with relations
      return await tx.lineReservationSettings.findUnique({
        where: { id: settings.id },
        include: {
          daySchedules: {
            orderBy: { dayOfWeek: "asc" }
          }
        }
      });
    });

    return result;
  }

  /**
   * Delete reservation settings for a line
   */
  async delete(lineId: string): Promise<void> {
    await lineReservationSettingsRepository.delete(lineId);
  }
}

export const lineReservationSettingsService = new LineReservationSettingsService();
