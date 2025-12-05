import React from "react";
import { LinesTab } from "@/modules/lines";

export default async function LinesPage({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await params;
  return <LinesTab venueId={venueId} />;
}

