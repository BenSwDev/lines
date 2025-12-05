import { prisma } from "@/core/integrations/prisma/client";
import type { VenueDetails, Prisma } from "@prisma/client";

export class VenueDetailsRepository {
  async findByVenueId(venueId: string): Promise<VenueDetails | null> {
    return prisma.venueDetails.findUnique({
      where: { venueId },
    });
  }

  async create(data: Prisma.VenueDetailsCreateInput): Promise<VenueDetails> {
    return prisma.venueDetails.create({
      data,
    });
  }

  async update(
    venueId: string,
    data: Prisma.VenueDetailsUpdateInput
  ): Promise<VenueDetails> {
    return prisma.venueDetails.update({
      where: { venueId },
      data,
    });
  }

  async upsert(
    venueId: string,
    data: Omit<Prisma.VenueDetailsCreateInput, "venue">
  ): Promise<VenueDetails> {
    return prisma.venueDetails.upsert({
      where: { venueId },
      create: {
        ...data,
        venue: { connect: { id: venueId } },
      },
      update: data,
    });
  }

  async delete(venueId: string): Promise<VenueDetails> {
    return prisma.venueDetails.delete({
      where: { venueId },
    });
  }
}

export const venueDetailsRepository = new VenueDetailsRepository();

