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
    return prisma.venueArea.update({
      where: { id },
      data
    });
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
