import { prisma } from "@/core/integrations/prisma/client";
import type { Line, Prisma } from "@prisma/client";

export class LineRepository {
  async findByVenueId(venueId: string) {
    return prisma.line.findMany({
      where: { venueId },
      include: {
        occurrences: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async findById(id: string) {
    return prisma.line.findUnique({
      where: { id },
      include: {
        occurrences: {
          orderBy: { date: "asc" }
        }
      }
    });
  }

  async create(data: Prisma.LineCreateInput): Promise<Line> {
    return prisma.line.create({
      data
    });
  }

  async update(
    id: string,
    data: Prisma.LineUpdateInput | Prisma.LineUncheckedUpdateInput
  ): Promise<Line> {
    // Filter out all undefined values recursively to prevent Prisma errors
    const cleanData = this.removeUndefinedValues(data) as
      | Prisma.LineUpdateInput
      | Prisma.LineUncheckedUpdateInput;

    return prisma.line.update({
      where: { id },
      data: cleanData
    });
  }

  /**
   * Recursively remove undefined values from an object
   * This prevents Prisma from trying to update non-existent columns
   */
  private removeUndefinedValues(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeUndefinedValues(item));
    }

    if (typeof obj === "object") {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      }
      return cleaned;
    }

    return obj;
  }

  async delete(id: string): Promise<Line> {
    return prisma.line.delete({
      where: { id }
    });
  }

  async findUsedColorsByVenueId(venueId: string): Promise<string[]> {
    const lines = await prisma.line.findMany({
      where: { venueId },
      select: { color: true }
    });
    return lines.map((line) => line.color);
  }

  async countByVenueId(venueId: string): Promise<number> {
    return prisma.line.count({
      where: { venueId }
    });
  }

  async isColorAvailable(venueId: string, color: string, excludeLineId?: string): Promise<boolean> {
    const existing = await prisma.line.findFirst({
      where: {
        venueId,
        color,
        id: excludeLineId ? { not: excludeLineId } : undefined
      }
    });
    return !existing;
  }
}

export const lineRepository = new LineRepository();
