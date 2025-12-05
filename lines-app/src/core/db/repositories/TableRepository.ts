import { prisma } from "@/core/integrations/prisma/client";
import type { Table, Prisma } from "@prisma/client";

export class TableRepository {
  async findByZoneId(zoneId: string): Promise<Table[]> {
    return prisma.table.findMany({
      where: { zoneId },
      orderBy: { name: "asc" }
    });
  }

  async findById(id: string): Promise<Table | null> {
    return prisma.table.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.TableCreateInput): Promise<Table> {
    return prisma.table.create({
      data
    });
  }

  async update(id: string, data: Prisma.TableUpdateInput): Promise<Table> {
    return prisma.table.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Table> {
    return prisma.table.delete({
      where: { id }
    });
  }

  async countByZoneId(zoneId: string): Promise<number> {
    return prisma.table.count({
      where: { zoneId }
    });
  }

  async getTotalCapacityByZoneId(zoneId: string): Promise<number> {
    const tables = await this.findByZoneId(zoneId);
    return tables.reduce((sum, table) => sum + (table.seats || 0), 0);
  }
}

export const tableRepository = new TableRepository();
