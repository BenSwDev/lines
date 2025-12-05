import { prisma } from "@/core/integrations/prisma/client";
import type { Menu, Prisma } from "@prisma/client";

export class MenuRepository {
  async findByVenueId(venueId: string): Promise<Menu[]> {
    return prisma.menu.findMany({
      where: { venueId },
      orderBy: { uploadedAt: "desc" },
    });
  }

  async findById(id: string): Promise<Menu | null> {
    return prisma.menu.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.MenuCreateInput): Promise<Menu> {
    return prisma.menu.create({
      data,
    });
  }

  async update(id: string, data: Prisma.MenuUpdateInput): Promise<Menu> {
    return prisma.menu.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Menu> {
    return prisma.menu.delete({
      where: { id },
    });
  }

  async countByVenueId(venueId: string): Promise<number> {
    return prisma.menu.count({
      where: { venueId },
    });
  }
}

export const menuRepository = new MenuRepository();

