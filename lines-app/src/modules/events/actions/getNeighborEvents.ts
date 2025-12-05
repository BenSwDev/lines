"use server";

import { eventsService } from "../services/eventsService";
import { withErrorHandling } from "@/core/http/errorHandler";

export async function getNeighborEvents(lineId: string, currentDate: string) {
  return withErrorHandling(
    () => eventsService.getNeighborEvents(lineId, currentDate),
    "Error getting neighbor events"
  );
}
