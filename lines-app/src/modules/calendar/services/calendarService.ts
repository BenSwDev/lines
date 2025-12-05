import { lineOccurrenceRepository } from "@/core/db";
import { isOvernightShift } from "@/core/validation";

export class CalendarService {
  async getVenueCalendarData(venueId: string) {
    const occurrences = await lineOccurrenceRepository.findByVenueId(venueId);

    return occurrences.map((occ) => ({
      ...occ,
      isOvernight: isOvernightShift(occ.startTime, occ.endTime),
    }));
  }

  /**
   * Calculate hour compression bounds (earliest start to latest end)
   */
  calculateHourBounds(occurrences: Array<{ startTime: string; endTime: string }>) {
    if (occurrences.length === 0) {
      return { minHour: 0, maxHour: 24 };
    }

    const hours = occurrences.flatMap((occ) => {
      const [startH] = occ.startTime.split(":").map(Number);
      const [endH] = occ.endTime.split(":").map(Number);
      return [startH, endH === 24 ? 0 : endH];
    });

    const minHour = Math.max(0, Math.min(...hours) - 1); // Padding
    const maxHour = Math.min(24, Math.max(...hours) + 1);

    return { minHour, maxHour };
  }
}

export const calendarService = new CalendarService();

