/**
 * Collision Detection for Line Occurrences
 * Ensures no two events overlap in time at the same venue
 */

export interface TimeRange {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

/**
 * Check if two time ranges overlap
 */
export function doTimeRangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
  // Different dates cannot overlap
  if (range1.date !== range2.date) {
    return false;
  }

  const [start1Hour, start1Min] = range1.startTime.split(":").map(Number);
  const [end1Hour, end1Min] = range1.endTime.split(":").map(Number);
  const [start2Hour, start2Min] = range2.startTime.split(":").map(Number);
  const [end2Hour, end2Min] = range2.endTime.split(":").map(Number);

  // Convert to minutes for easier comparison
  const start1Minutes = start1Hour * 60 + start1Min;
  let end1Minutes = end1Hour * 60 + end1Min;
  const start2Minutes = start2Hour * 60 + start2Min;
  let end2Minutes = end2Hour * 60 + end2Min;

  // Handle overnight shifts (endTime <= startTime or 24:00)
  if (
    range1.endTime === "24:00" ||
    end1Hour < start1Hour ||
    (end1Hour === start1Hour && end1Min <= start1Min)
  ) {
    end1Minutes = 24 * 60; // End of day
  }

  if (
    range2.endTime === "24:00" ||
    end2Hour < start2Hour ||
    (end2Hour === start2Hour && end2Min <= start2Min)
  ) {
    end2Minutes = 24 * 60; // End of day
  }

  // Check for overlap: ranges overlap if one starts before the other ends
  // and one ends after the other starts
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

/**
 * Check if a new time range collides with existing occurrences
 */
export function checkCollision(
  newRange: TimeRange,
  existingRanges: TimeRange[]
): { hasCollision: boolean; conflictingRange?: TimeRange } {
  for (const existing of existingRanges) {
    if (doTimeRangesOverlap(newRange, existing)) {
      return { hasCollision: true, conflictingRange: existing };
    }
  }

  return { hasCollision: false };
}

/**
 * Check multiple ranges for collisions
 */
export function checkMultipleCollisions(
  newRanges: TimeRange[],
  existingRanges: TimeRange[]
): { hasCollision: boolean; conflictingRanges: TimeRange[] } {
  const conflicts: TimeRange[] = [];

  for (const newRange of newRanges) {
    const result = checkCollision(newRange, existingRanges);
    if (result.hasCollision && result.conflictingRange) {
      conflicts.push(result.conflictingRange);
    }
  }

  // Also check for collisions within newRanges themselves
  for (let i = 0; i < newRanges.length; i++) {
    for (let j = i + 1; j < newRanges.length; j++) {
      if (doTimeRangesOverlap(newRanges[i], newRanges[j])) {
        conflicts.push(newRanges[j]);
      }
    }
  }

  return {
    hasCollision: conflicts.length > 0,
    conflictingRanges: conflicts
  };
}
