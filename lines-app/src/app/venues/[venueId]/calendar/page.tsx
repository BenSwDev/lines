import React from "react";
import { CalendarTab } from "@/modules/calendar";

export default async function CalendarPage({ params }: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await params;
  return <CalendarTab venueId={venueId} />;
}
