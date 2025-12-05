import { prisma } from "@/core/integrations/prisma/client";
import type { Zone, Prisma } from "@prisma/client";

export class ZoneRepository {
  async findByVenueId(venueId: string) {
    return prisma.zone.findMany({
      where: { venueId },
      include: {
        tables: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.zone.findUnique({
      where: { id },
      include: {
        tables: true,
      },
    });
  }

  async create(data: Prisma.ZoneCreateInput): Promise<Zone> {
    return prisma.zone.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ZoneUpdateInput): Promise<Zone> {
    return prisma.zone.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Zone> {
    return prisma.zone.delete({
      where: { id },
    });
  }

  async countByVenueId(venueId: string): Promise<number> {
    return prisma.zone.count({
      where: { venueId },
    });
  }
}

export const zoneRepository = new ZoneRepository();

