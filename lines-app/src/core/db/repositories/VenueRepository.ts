import { prisma } from "@/core/integrations/prisma/client";
import type { Venue, Prisma } from "@prisma/client";

export class VenueRepository {
  async findAll(): Promise<Venue[]> {
    return prisma.venue.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<Venue | null> {
    return prisma.venue.findUnique({
      where: { id },
    });
  }

  async findByIdWithRelations(id: string) {
    return prisma.venue.findUnique({
      where: { id },
      include: {
        details: true,
        menus: true,
        zones: {
          include: {
            tables: true,
          },
        },
        lines: {
          include: {
            occurrences: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.VenueCreateInput): Promise<Venue> {
    return prisma.venue.create({
      data,
    });
  }

  async update(id: string, data: Prisma.VenueUpdateInput): Promise<Venue> {
    return prisma.venue.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Venue> {
    return prisma.venue.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return prisma.venue.count();
  }
}

export const venueRepository = new VenueRepository();

