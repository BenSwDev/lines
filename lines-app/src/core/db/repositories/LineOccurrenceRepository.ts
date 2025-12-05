import { prisma } from "@/core/integrations/prisma/client";
import type { LineOccurrence, Prisma } from "@prisma/client";

export class LineOccurrenceRepository {
  async findByLineId(lineId: string): Promise<LineOccurrence[]> {
    return prisma.lineOccurrence.findMany({
      where: { lineId },
      orderBy: { date: "asc" }
    });
  }

  async findByVenueId(venueId: string): Promise<LineOccurrence[]> {
    return prisma.lineOccurrence.findMany({
      where: { venueId },
      include: {
        line: true
      },
      orderBy: { date: "asc" }
    });
  }

  async findById(id: string) {
    return prisma.lineOccurrence.findUnique({
      where: { id },
      include: {
        line: true
      }
    });
  }

  async findByLineIdAndDate(lineId: string, date: string): Promise<LineOccurrence | null> {
    return prisma.lineOccurrence.findUnique({
      where: {
        lineId_date: {
          lineId,
          date
        }
      }
    });
  }

  async create(data: Prisma.LineOccurrenceCreateInput): Promise<LineOccurrence> {
    return prisma.lineOccurrence.create({
      data
    });
  }

  async createMany(data: Prisma.LineOccurrenceCreateManyInput[]): Promise<number> {
    const result = await prisma.lineOccurrence.createMany({
      data,
      skipDuplicates: true
    });
    return result.count;
  }

  async update(id: string, data: Prisma.LineOccurrenceUpdateInput): Promise<LineOccurrence> {
    return prisma.lineOccurrence.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<LineOccurrence> {
    return prisma.lineOccurrence.delete({
      where: { id }
    });
  }

  async deleteByLineId(lineId: string): Promise<number> {
    const result = await prisma.lineOccurrence.deleteMany({
      where: { lineId }
    });
    return result.count;
  }

  async getNeighbors(lineId: string, currentDate: string) {
    const allOccurrences = await this.findByLineId(lineId);
    const currentIndex = allOccurrences.findIndex((occ) => occ.date === currentDate);

    return {
      previous: currentIndex > 0 ? allOccurrences[currentIndex - 1] : null,
      next: currentIndex < allOccurrences.length - 1 ? allOccurrences[currentIndex + 1] : null
    };
  }

  async countByLineId(lineId: string): Promise<number> {
    return prisma.lineOccurrence.count({
      where: { lineId }
    });
  }

  async countActiveByLineId(lineId: string): Promise<number> {
    return prisma.lineOccurrence.count({
      where: {
        lineId,
        isActive: true
      }
    });
  }
}

export const lineOccurrenceRepository = new LineOccurrenceRepository();
