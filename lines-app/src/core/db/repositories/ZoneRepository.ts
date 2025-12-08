import { prisma } from "@/core/integrations/prisma/client";
import type { Zone, Prisma } from "@prisma/client";

export class ZoneRepository {
  async findByVenueId(venueId: string) {
    return prisma.zone.findMany({
      where: { venueId },
      include: {
        tables: true
      },
      orderBy: { createdAt: "asc" }
    });
  }

  async findById(id: string) {
    return prisma.zone.findUnique({
      where: { id },
      include: {
        tables: true
      }
    });
  }

  async create(data: Prisma.ZoneCreateInput): Promise<Zone> {
    return prisma.zone.create({
      data
    });
  }

  async update(id: string, data: Prisma.ZoneUpdateInput): Promise<Zone> {
    // Filter out all undefined values recursively to prevent Prisma errors
    const cleanData = this.removeUndefinedValues(data) as Prisma.ZoneUpdateInput;
    
    return prisma.zone.update({
      where: { id },
      data: cleanData
    });
  }

  /**
   * Recursively remove undefined values from an object
   * This prevents Prisma from trying to update non-existent columns
   */
  private removeUndefinedValues(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeUndefinedValues(item));
    }

    if (typeof obj === "object") {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      }
      return cleaned;
    }

    return obj;
  }

  async delete(id: string): Promise<Zone> {
    return prisma.zone.delete({
      where: { id }
    });
  }

  async countByVenueId(venueId: string): Promise<number> {
    return prisma.zone.count({
      where: { venueId }
    });
  }
}

export const zoneRepository = new ZoneRepository();
