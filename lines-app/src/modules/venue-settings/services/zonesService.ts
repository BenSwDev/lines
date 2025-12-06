import { zoneRepository } from "@/core/db/repositories/ZoneRepository";
import type { Prisma } from "@prisma/client";

export class ZonesService {
  async listZones(venueId: string) {
    return zoneRepository.findByVenueId(venueId);
  }

  async getZone(id: string) {
    return zoneRepository.findById(id);
  }

  async createZone(venueId: string, data: { name: string; color: string; description?: string }) {
    return zoneRepository.create({
      venue: { connect: { id: venueId } },
      name: data.name,
      color: data.color,
      description: data.description || null
    });
  }

  async updateZone(id: string, data: Prisma.ZoneUpdateInput) {
    return zoneRepository.update(id, data);
  }

  async deleteZone(id: string) {
    return zoneRepository.delete(id);
  }
}

export const zonesService = new ZonesService();

