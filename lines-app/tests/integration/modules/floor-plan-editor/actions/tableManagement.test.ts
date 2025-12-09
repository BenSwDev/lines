import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createTable,
  updateTableContent,
  autoGenerateTables
} from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { floorPlanService } from "@/modules/floor-plan-editor/services/floorPlanService";
import { mockTable, mockZone } from "../../../../fixtures/floorPlans";

vi.mock("@/modules/floor-plan-editor/services/floorPlanService");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Table Management Integration", () => {
  const zoneId = "zone-1";
  const tableId = "table-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTable", () => {
    it("should create table successfully", async () => {
      const input = {
        zoneId,
        name: "Table 1",
        seats: 4
      };

      vi.mocked(floorPlanService.createTable).mockResolvedValue(mockTable as any);

      const result = await createTable(input);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockTable.id);
    });

    it("should create table in zone", async () => {
      const input = {
        zoneId,
        name: "Table in Zone",
        seats: 6,
        positionX: 150,
        positionY: 150
      };

      vi.mocked(floorPlanService.createTable).mockResolvedValue({
        ...mockTable,
        ...input
      } as any);

      const result = await createTable(input);

      expect(result.success).toBe(true);
    });
  });

  describe("updateTableContent", () => {
    it("should update table content", async () => {
      const input = {
        id: tableId,
        name: "Updated Table Name"
      };

      vi.mocked(floorPlanService.updateTableContent).mockResolvedValue({
        ...mockTable,
        name: "Updated Table Name"
      } as any);

      const result = await updateTableContent(input);

      expect(result.success).toBe(true);
    });
  });

  describe("autoGenerateTables", () => {
    it("should auto-generate tables", async () => {
      const input = {
        zoneId,
        count: 10,
        tableWidth: 60,
        tableHeight: 60,
        spacing: 20
      };

      const generatedTables = Array.from({ length: 10 }, (_, i) => ({
        ...mockTable,
        id: `table-${i + 1}`,
        tableNumber: i + 1
      }));

      vi.mocked(floorPlanService.autoGenerateTables).mockResolvedValue(generatedTables as any);

      const result = await autoGenerateTables(input);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(10);
    });
  });
});
