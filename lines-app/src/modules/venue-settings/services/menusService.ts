import { menuRepository } from "@/core/db";
import type { CreateMenuInput, UpdateMenuInput } from "../schemas/menusSchemas";

export class MenusService {
  async listMenus(venueId: string) {
    return menuRepository.findByVenueId(venueId);
  }

  async getMenu(id: string) {
    return menuRepository.findById(id);
  }

  async createMenu(venueId: string, input: CreateMenuInput) {
    return menuRepository.create({
      venue: { connect: { id: venueId } },
      name: input.name,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      fileData: input.fileData,
    });
  }

  async updateMenu(id: string, input: UpdateMenuInput) {
    return menuRepository.update(id, input);
  }

  async deleteMenu(id: string) {
    return menuRepository.delete(id);
  }
}

export const menusService = new MenusService();

