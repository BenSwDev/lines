import { prisma } from "@/core/integrations/prisma/client";
import type { LineReservationSettings, Prisma } from "@prisma/client";

export type LineReservationSettingsWithRelations = LineReservationSettings & {
  daySchedules: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    intervalMinutes: number | null;
    customerMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export class LineReservationSettingsRepository {
  async findByLineId(lineId: string): Promise<LineReservationSettingsWithRelations | null> {
    return prisma.lineReservationSettings.findUnique({
      where: { lineId },
      include: {
        daySchedules: {
          orderBy: { dayOfWeek: "asc" }
        }
      }
    });
  }

  async getOrCreate(lineId: string): Promise<LineReservationSettingsWithRelations> {
    let settings = await this.findByLineId(lineId);

    if (!settings) {
      settings = await prisma.lineReservationSettings.create({
        data: {
          lineId,
          allowPersonalLink: false,
          requireApproval: false,
          manageWaitlist: false
        },
        include: {
          daySchedules: {
            orderBy: { dayOfWeek: "asc" }
          }
        }
      });
    }

    return settings;
  }

  async update(
    lineId: string,
    data: Prisma.LineReservationSettingsUpdateInput
  ): Promise<LineReservationSettingsWithRelations> {
    return prisma.lineReservationSettings.update({
      where: { lineId },
      data,
      include: {
        daySchedules: {
          orderBy: { dayOfWeek: "asc" }
        }
      }
    });
  }

  async delete(lineId: string): Promise<void> {
    await prisma.lineReservationSettings.delete({
      where: { lineId }
    });
  }
}

export const lineReservationSettingsRepository = new LineReservationSettingsRepository();
