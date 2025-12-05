import { tableRepository } from "@/core/db";
import type { CreateTableInput, UpdateTableInput } from "../schemas/tablesSchemas";

export class TablesService {
  async listTables(zoneId: string) {
    return tableRepository.findByZoneId(zoneId);
  }

  async getTable(id: string) {
    return tableRepository.findById(id);
  }

  async createTable(zoneId: string, input: CreateTableInput) {
    return tableRepository.create({
      zone: { connect: { id: zoneId } },
      name: input.name,
      seats: input.seats,
      notes: input.notes
    });
  }

  async updateTable(id: string, input: UpdateTableInput) {
    return tableRepository.update(id, input);
  }

  async deleteTable(id: string) {
    return tableRepository.delete(id);
  }
}

export const tablesService = new TablesService();

