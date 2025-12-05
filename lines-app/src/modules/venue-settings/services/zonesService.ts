import { zoneRepository } from "@/core/db";
import type { CreateZoneInput, UpdateZoneInput } from "../schemas/zonesSchemas";

export class ZonesService {
  async listZones(venueId: string) {
    return zoneRepository.findByVenueId(venueId);
  }

  async getZone(id: string) {
    return zoneRepository.findById(id);
  }

  async createZone(venueId: string, input: CreateZoneInput) {
    return zoneRepository.create({
      venue: { connect: { id: venueId } },
      name: input.name,
      color: input.color,
      description: input.description
    });
  }

  async updateZone(id: string, input: UpdateZoneInput) {
    return zoneRepository.update(id, input);
  }

  async deleteZone(id: string) {
    return zoneRepository.delete(id);
  }
}

export const zonesService = new ZonesService();
