/**
 * Generic date utilities for the Lines app
 */

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function addDays(date: Date | string, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date | string, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function toISODate(date: Date | string): string {
  const d = new Date(date);
  // Use local date to avoid timezone issues
  // Format as YYYY-MM-DD using local timezone
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date | string, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Get start of week for Hebrew calendar (Saturday = 6)
 * In Hebrew calendar, week starts on Saturday
 */
export function getStartOfWeek(date: Date | string): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday

  // Calculate days to subtract to get to Saturday (start of Hebrew week)
  // If day is Saturday (6), subtract 0
  // If day is Sunday (0), subtract 1 to get Saturday
  // If day is Monday (1), subtract 2, etc.
  const daysToSubtract = day === 6 ? 0 : (day + 1) % 7;

  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
}

/**
 * Get today's date as YYYY-MM-DD using local timezone
 */
export function getTodayISODate(): string {
  return toISODate(new Date());
}
