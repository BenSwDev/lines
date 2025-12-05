import { lineOccurrenceRepository } from "@/core/db";
import type { Line } from "@prisma/client";

export interface OccurrenceInput {
  date: string;
  isExpected: boolean;
  isActive?: boolean;
  startTime?: string; // Optional - if provided, use this instead of line's default
  endTime?: string; // Optional - if provided, use this instead of line's default
}

export class LineOccurrencesSyncService {
  /**
   * Sync occurrences for a line (create/update based on suggestions + manual dates)
   */
  async syncOccurrences(line: Line, occurrences: OccurrenceInput[]): Promise<void> {
    // For simplicity, we'll delete existing and recreate
    // In production, you might want incremental sync
    await lineOccurrenceRepository.deleteByLineId(line.id);

    if (occurrences.length === 0) {
      return;
    }

    const createData = occurrences.map((occ) => ({
      lineId: line.id,
      venueId: line.venueId,
      date: occ.date,
      startTime: occ.startTime || line.startTime,
      endTime: occ.endTime || line.endTime,
      isExpected: occ.isExpected,
      isActive: occ.isActive ?? true
    }));

    await lineOccurrenceRepository.createMany(createData);
  }

  /**
   * Sync occurrences with per-occurrence schedules (new flexible structure)
   */
  async syncOccurrencesWithSchedules(line: Line, occurrences: OccurrenceInput[]): Promise<void> {
    await lineOccurrenceRepository.deleteByLineId(line.id);

    if (occurrences.length === 0) {
      return;
    }

    const createData = occurrences.map((occ) => ({
      lineId: line.id,
      venueId: line.venueId,
      date: occ.date,
      startTime: occ.startTime || line.startTime,
      endTime: occ.endTime || line.endTime,
      isExpected: occ.isExpected,
      isActive: occ.isActive ?? true
    }));

    await lineOccurrenceRepository.createMany(createData);
  }

  /**
   * Add manual occurrence to an existing line
   */
  async addManualOccurrence(
    lineId: string,
    venueId: string,
    date: string,
    startTime: string,
    endTime: string
  ) {
    // Check if already exists
    const existing = await lineOccurrenceRepository.findByLineIdAndDate(lineId, date);

    if (existing) {
      throw new Error("תאריך כבר קיים עבור הליין הזה");
    }

    return lineOccurrenceRepository.create({
      line: { connect: { id: lineId } },
      venue: { connect: { id: venueId } },
      date,
      startTime,
      endTime,
      isExpected: false,
      isActive: true
    });
  }

  /**
   * Cancel (deactivate) an occurrence
   */
  async cancelOccurrence(id: string) {
    return lineOccurrenceRepository.update(id, {
      isActive: false
    });
  }

  /**
   * Reactivate a cancelled occurrence
   */
  async reactivateOccurrence(id: string) {
    return lineOccurrenceRepository.update(id, {
      isActive: true
    });
  }
}

export const lineOccurrencesSyncService = new LineOccurrencesSyncService();
