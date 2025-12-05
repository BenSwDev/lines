import React from "react";
import { notFound } from "next/navigation";
import { WorkspaceLayout } from "@/modules/workspace-shell";
import { venuesService } from "@/modules/venues/services/venuesService";

export default async function VenueLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ venueId: string }>;
}) {
  const { venueId } = await params;
  const venue = await venuesService.getVenue(venueId);

  if (!venue) {
    notFound();
  }

  return <WorkspaceLayout venue={venue}>{children}</WorkspaceLayout>;
}
