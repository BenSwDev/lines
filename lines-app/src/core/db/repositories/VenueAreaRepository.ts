import { prisma } from "@/core/integrations/prisma/client";
import type { VenueArea, Prisma } from "@prisma/client";

export class VenueAreaRepository {
  async findByVenueId(venueId: string): Promise<VenueArea[]> {
    return prisma.venueArea.findMany({
      where: { venueId },
      orderBy: { createdAt: "asc" }
    });
  }

  async findById(id: string): Promise<VenueArea | null> {
    return prisma.venueArea.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.VenueAreaCreateInput): Promise<VenueArea> {
    return prisma.venueArea.create({
      data
    });
  }

  async update(id: string, data: Prisma.VenueAreaUpdateInput): Promise<VenueArea> {
    // Filter out all undefined values recursively to prevent Prisma errors
    const cleanData = this.removeUndefinedValues(data) as Prisma.VenueAreaUpdateInput;

    return prisma.venueArea.update({
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

  async delete(id: string): Promise<VenueArea> {
    return prisma.venueArea.delete({
      where: { id }
    });
  }

  async deleteByVenueId(venueId: string): Promise<void> {
    await prisma.venueArea.deleteMany({
      where: { venueId }
    });
  }
}

export const venueAreaRepository = new VenueAreaRepository();
