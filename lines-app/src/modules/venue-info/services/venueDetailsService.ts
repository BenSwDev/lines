import { venueDetailsRepository } from "@/core/db";

export class VenueDetailsService {
  async getVenueDetails(venueId: string) {
    return venueDetailsRepository.findByVenueId(venueId);
  }

  async updateVenueDetails(
    venueId: string,
    data: { phone?: string; email?: string; address?: string }
  ) {
    return venueDetailsRepository.upsert(venueId, {
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
    });
  }
}

export const venueDetailsService = new VenueDetailsService();

