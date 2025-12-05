import React from "react";
import { VenueSettingsTab } from "@/modules/venue-settings";

export default async function VenueSettingsPage({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await params;
  return <VenueSettingsTab venueId={venueId} />;
}

