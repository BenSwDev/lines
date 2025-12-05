import { venueRepository } from "@/core/db";
import { prisma } from "@/core/integrations/prisma/client";
import type { Venue } from "@prisma/client";

export class VenuesService {
  async listVenues(): Promise<Venue[]> {
    return venueRepository.findAll();
  }

  async listUserVenues(userId: string): Promise<Venue[]> {
    return prisma.venue.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async getVenue(id: string): Promise<Venue | null> {
    return venueRepository.findById(id);
  }

  async getVenueWithDetails(id: string) {
    return venueRepository.findByIdWithRelations(id);
  }

  async createVenue(name: string, userId: string): Promise<Venue> {
    return venueRepository.create({
      name,
      user: { connect: { id: userId } }
    });
  }

  async updateVenue(id: string, name: string): Promise<Venue> {
    return venueRepository.update(id, {
      name
    });
  }

  async deleteVenue(id: string, userId: string): Promise<Venue> {
    // Verify ownership before delete
    const venue = await venueRepository.findById(id);

    if (!venue) {
      throw new Error("Venue not found");
    }

    if (venue.userId !== userId) {
      throw new Error("Unauthorized - you don't own this venue");
    }

    // Cascade deletes are handled by Prisma (onDelete: Cascade in schema)
    return venueRepository.delete(id);
  }

  async venueExists(id: string): Promise<boolean> {
    const venue = await venueRepository.findById(id);
    return venue !== null;
  }
}

export const venuesService = new VenuesService();
