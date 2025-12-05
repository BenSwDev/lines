import { addDays, addMonths, toISODate } from "@/utils/date";
import { DEFAULT_SUGGESTION_MONTHS } from "@/core/config/constants";

export type Frequency = "weekly" | "monthly" | "variable" | "oneTime";

export class LineScheduleService {
  /**
   * Generate suggested dates based on schedule parameters
   */
  generateSuggestions(
    days: number[],
    frequency: Frequency,
    anchorDate: Date = new Date(),
    horizonMonths: number = DEFAULT_SUGGESTION_MONTHS
  ): string[] {
    if (days.length === 0) {
      return [];
    }

    const endDate = addMonths(anchorDate, horizonMonths);
    const suggestions: string[] = [];

    switch (frequency) {
      case "weekly":
        suggestions.push(...this.generateWeekly(days, anchorDate, endDate));
        break;
      case "monthly":
        suggestions.push(...this.generateMonthly(days, anchorDate, endDate));
        break;
      case "oneTime":
        suggestions.push(...this.generateOneTime(days, anchorDate));
        break;
      case "variable":
        // For variable, return empty - user will add manual dates
        break;
    }

    return suggestions.sort();
  }

  private generateWeekly(days: number[], start: Date, end: Date): string[] {
    const results: string[] = [];
    let current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (days.includes(dayOfWeek)) {
        results.push(toISODate(current));
      }
      current = addDays(current, 1);
    }

    return results;
  }

  private generateMonthly(days: number[], start: Date, end: Date): string[] {
    const results: string[] = [];
    let currentMonth = new Date(start.getFullYear(), start.getMonth(), 1);

    while (currentMonth <= end) {
      // For each selected day of week, find all occurrences in this month
      days.forEach((targetDay) => {
        let date = new Date(currentMonth);

        // Find first occurrence of targetDay in month
        while (date.getDay() !== targetDay && date.getMonth() === currentMonth.getMonth()) {
          date = addDays(date, 1);
        }

        // Add all occurrences of this day in the month
        while (date.getMonth() === currentMonth.getMonth() && date <= end) {
          if (date >= start) {
            results.push(toISODate(date));
          }
          date = addDays(date, 7);
        }
      });

      currentMonth = addMonths(currentMonth, 1);
    }

    return results.sort();
  }

  private generateOneTime(days: number[], start: Date): string[] {
    // For one-time, find the next occurrence of each selected day
    const results: string[] = [];
    const today = new Date(start);

    days.forEach((targetDay) => {
      let date = new Date(today);

      // Find next occurrence of this day
      while (date.getDay() !== targetDay) {
        date = addDays(date, 1);
      }

      results.push(toISODate(date));
    });

    return results.sort();
  }
}

export const lineScheduleService = new LineScheduleService();

