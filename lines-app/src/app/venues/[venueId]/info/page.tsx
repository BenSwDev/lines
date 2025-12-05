import React from "react";
import { VenueInfoTab } from "@/modules/venue-info";
import { venuesService } from "@/modules/venues/services/venuesService";
import { notFound } from "next/navigation";

export default async function VenueInfoPage({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await params;
  const venue = await venuesService.getVenue(venueId);

  if (!venue) {
    notFound();
  }

  return <VenueInfoTab venue={venue} />;
}

