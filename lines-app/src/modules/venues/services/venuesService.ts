import { venueRepository } from "@/core/db";
import type { Venue } from "@prisma/client";

export class VenuesService {
  async listVenues(): Promise<Venue[]> {
    return venueRepository.findAll();
  }

  async getVenue(id: string): Promise<Venue | null> {
    return venueRepository.findById(id);
  }

  async getVenueWithDetails(id: string) {
    return venueRepository.findByIdWithRelations(id);
  }

  async createVenue(name: string): Promise<Venue> {
    return venueRepository.create({
      name,
    });
  }

  async updateVenue(id: string, name: string): Promise<Venue> {
    return venueRepository.update(id, {
      name,
    });
  }

  async deleteVenue(id: string): Promise<Venue> {
    // Cascade deletes are handled by Prisma (onDelete: Cascade in schema)
    return venueRepository.delete(id);
  }

  async venueExists(id: string): Promise<boolean> {
    const venue = await venueRepository.findById(id);
    return venue !== null;
  }
}

export const venuesService = new VenuesService();

