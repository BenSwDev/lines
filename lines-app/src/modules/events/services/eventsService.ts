import { lineOccurrenceRepository } from "@/core/db";
import type { EventStatus } from "../types";

export class EventsService {
  /**
   * Get event status based on current time and event state
   */
  getEventStatus(
    occurrence: {
      isActive: boolean;
      date: string;
      startTime: string;
      endTime: string;
    }
  ): EventStatus {
    if (!occurrence.isActive) {
      return "cancelled";
    }

    const now = new Date();
    const [year, month, day] = occurrence.date.split("-").map(Number);
    const [startHour, startMin] = occurrence.startTime.split(":").map(Number);
    const [endHour, endMin] = occurrence.endTime.split(":").map(Number);

    const startDateTime = new Date(year, month - 1, day, startHour, startMin);
    let endDateTime = new Date(year, month - 1, day, endHour, endMin);

    // Handle overnight (endTime <= startTime or 24:00)
    if (occurrence.endTime === "24:00" || endHour < startHour || 
        (endHour === startHour && endMin <= startMin)) {
      endDateTime = new Date(year, month - 1, day + 1, endHour === 24 ? 0 : endHour, endMin);
    }

    if (now > endDateTime) {
      return "ended";
    }

    if (now >= startDateTime && now <= endDateTime) {
      return "current";
    }

    return "upcoming";
  }

  async getEventDetail(occurrenceId: string) {
    return lineOccurrenceRepository.findById(occurrenceId);
  }

  async getNeighborEvents(lineId: string, currentDate: string) {
    return lineOccurrenceRepository.getNeighbors(lineId, currentDate);
  }
}

export const eventsService = new EventsService();

