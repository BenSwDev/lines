import { prisma } from "@/core/integrations/prisma/client";
import type { ReservationSettingsWithRelations, ReservationSettingsInput } from "../types";
import { reservationSettingsSchema } from "../schemas/reservationSettingsSchemas";

export class ReservationSettingsService {
  /**
   * Get reservation settings for a venue, creating default if not exists
   */
  async getOrCreate(venueId: string): Promise<ReservationSettingsWithRelations> {
    let settings = await prisma.reservationSettings.findUnique({
      where: { venueId },
      include: {
        excludedLines: {
          include: {
            line: true
          }
        },
        daySchedules: {
          orderBy: { dayOfWeek: "asc" }
        }
      }
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.reservationSettings.create({
        data: {
          venueId,
          acceptsReservations: false,
          allowPersonalLink: false,
          requireApproval: false,
          manualRegistrationOnly: true,
          manageWaitlist: false
        },
        include: {
          excludedLines: {
            include: {
              line: true
            }
          },
          daySchedules: {
            orderBy: { dayOfWeek: "asc" }
          }
        }
      });
    }

    return settings as ReservationSettingsWithRelations;
  }

  /**
   * Update reservation settings for a venue
   */
  async update(
    venueId: string,
    input: ReservationSettingsInput
  ): Promise<ReservationSettingsWithRelations> {
    // Validate input
    const validated = reservationSettingsSchema.parse(input);

    // Verify venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    });

    if (!venue) {
      throw new Error("Venue not found");
    }

    // Verify all excluded line IDs exist and belong to this venue
    if (validated.excludedLineIds.length > 0) {
      const lines = await prisma.line.findMany({
        where: {
          id: { in: validated.excludedLineIds },
          venueId
        }
      });

      if (lines.length !== validated.excludedLineIds.length) {
        throw new Error("One or more line IDs are invalid or do not belong to this venue");
      }
    }

    // Use transaction to update settings and related data
    const result = await prisma.$transaction(async (tx) => {
      // Get or create settings
      let settings = await tx.reservationSettings.findUnique({
        where: { venueId }
      });

      if (!settings) {
        settings = await tx.reservationSettings.create({
          data: {
            venueId,
            acceptsReservations: validated.acceptsReservations,
            allowPersonalLink: validated.allowPersonalLink,
            requireApproval: validated.requireApproval,
            manualRegistrationOnly: validated.manualRegistrationOnly,
            manageWaitlist: validated.manageWaitlist
          }
        });
      } else {
        settings = await tx.reservationSettings.update({
          where: { id: settings.id },
          data: {
            acceptsReservations: validated.acceptsReservations,
            allowPersonalLink: validated.allowPersonalLink,
            requireApproval: validated.requireApproval,
            manualRegistrationOnly: validated.manualRegistrationOnly,
            manageWaitlist: validated.manageWaitlist
          }
        });
      }

      // Update excluded lines
      await tx.reservationSettingsLineExclusion.deleteMany({
        where: { reservationSettingsId: settings.id }
      });

      if (validated.excludedLineIds.length > 0) {
        await tx.reservationSettingsLineExclusion.createMany({
          data: validated.excludedLineIds.map((lineId) => ({
            reservationSettingsId: settings.id,
            lineId
          }))
        });
      }

      // Update day schedules
      await tx.reservationSettingsDaySchedule.deleteMany({
        where: { reservationSettingsId: settings.id }
      });

      if (validated.daySchedules.length > 0) {
        await tx.reservationSettingsDaySchedule.createMany({
          data: validated.daySchedules.map((schedule) => ({
            reservationSettingsId: settings.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            intervalMinutes: schedule.intervalMinutes ?? null,
            customerMessage: schedule.customerMessage ?? null
          }))
        });
      }

      // Return updated settings with relations
      return await tx.reservationSettings.findUnique({
        where: { id: settings.id },
        include: {
          excludedLines: {
            include: {
              line: true
            }
          },
          daySchedules: {
            orderBy: { dayOfWeek: "asc" }
          }
        }
      });
    });

    return result as ReservationSettingsWithRelations;
  }

  /**
   * Delete reservation settings for a venue
   */
  async delete(venueId: string): Promise<void> {
    await prisma.reservationSettings.deleteMany({
      where: { venueId }
    });
  }
}

export const reservationSettingsService = new ReservationSettingsService();
