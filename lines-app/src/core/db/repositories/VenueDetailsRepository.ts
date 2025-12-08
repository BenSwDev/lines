import { prisma } from "@/core/integrations/prisma/client";
import type { VenueDetails, Prisma } from "@prisma/client";

export class VenueDetailsRepository {
  async findByVenueId(venueId: string): Promise<VenueDetails | null> {
    return prisma.venueDetails.findUnique({
      where: { venueId }
    });
  }

  async create(data: Prisma.VenueDetailsCreateInput): Promise<VenueDetails> {
    return prisma.venueDetails.create({
      data
    });
  }

  async update(venueId: string, data: Prisma.VenueDetailsUpdateInput): Promise<VenueDetails> {
    // Filter out all undefined values recursively to prevent Prisma errors
    const cleanData = this.removeUndefinedValues(data) as Prisma.VenueDetailsUpdateInput;
    
    return prisma.venueDetails.update({
      where: { venueId },
      data: cleanData
    });
  }

  async upsert(
    venueId: string,
    data: Omit<Prisma.VenueDetailsCreateInput, "venue">
  ): Promise<VenueDetails> {
    // Filter out all undefined values recursively to prevent Prisma errors
    const cleanCreateData = this.removeUndefinedValues({
      ...data,
      venue: { connect: { id: venueId } }
    }) as Prisma.VenueDetailsCreateInput;
    const cleanUpdateData = this.removeUndefinedValues(data) as Prisma.VenueDetailsUpdateInput;
    
    return prisma.venueDetails.upsert({
      where: { venueId },
      create: cleanCreateData,
      update: cleanUpdateData
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

  async delete(venueId: string): Promise<VenueDetails> {
    return prisma.venueDetails.delete({
      where: { venueId }
    });
  }
}

export const venueDetailsRepository = new VenueDetailsRepository();
