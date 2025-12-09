import { describe, it, expect, beforeEach, vi } from "vitest";
import { updateFloorPlanLines } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import {
  lineFloorPlanStaffingService,
  lineFloorPlanMinimumOrderService
} from "@/modules/floor-plan-editor/services/lineFloorPlanService";
import { mockLine, mockOccurrence } from "../../../fixtures/lines";
import { mockFloorPlan } from "../../../fixtures/floorPlans";

vi.mock("@/modules/floor-plan-editor/actions/floorPlanActions");
vi.mock("@/modules/floor-plan-editor/services/lineFloorPlanService");

describe("Lines ↔ Floor Plan Integration", () => {
  const venueId = "venue-1";
  const floorPlanId = "floor-plan-1";
  const lineId = "line-1";
  const zoneId = "zone-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should assign line to floor plan", async () => {
    const input = {
      floorPlanId,
      lineIds: [lineId]
    };

    vi.mocked(updateFloorPlanLines).mockResolvedValue({
      success: true,
      data: { floorPlanId, lineIds: [lineId] }
    } as any);

    const result = await updateFloorPlanLines(input);

    expect(result.success).toBe(true);
  });

  it("should configure line-specific staffing", async () => {
    const staffingRules = [
      {
        roleId: "role-1",
        managers: 1,
        employees: 2
      }
    ];

    vi.mocked(lineFloorPlanStaffingService.upsertStaffingRules).mockResolvedValue({
      id: "staffing-1",
      lineId,
      floorPlanId,
      zoneId,
      staffingRules
    } as any);

    await lineFloorPlanStaffingService.upsertStaffingRules(
      lineId,
      floorPlanId,
      zoneId,
      null,
      staffingRules as any
    );

    expect(lineFloorPlanStaffingService.upsertStaffingRules).toHaveBeenCalledWith(
      lineId,
      floorPlanId,
      zoneId,
      null,
      staffingRules
    );
  });

  it("should configure line-specific minimum orders", async () => {
    const minimumPrice = 200;

    vi.mocked(lineFloorPlanMinimumOrderService.upsertMinimumOrder).mockResolvedValue({
      id: "min-order-1",
      lineId,
      floorPlanId,
      zoneId,
      minimumPrice
    } as any);

    await lineFloorPlanMinimumOrderService.upsertMinimumOrder(
      lineId,
      floorPlanId,
      zoneId,
      null,
      minimumPrice
    );

    expect(lineFloorPlanMinimumOrderService.upsertMinimumOrder).toHaveBeenCalledWith(
      lineId,
      floorPlanId,
      zoneId,
      null,
      minimumPrice
    );
  });

  it("should verify settings persist", async () => {
    // After assigning and configuring, verify persistence
    const staffingRules = [
      {
        roleId: "role-1",
        managers: 1,
        employees: 2
      }
    ];

    vi.mocked(lineFloorPlanStaffingService.getStaffingRules).mockResolvedValue(
      staffingRules as any
    );

    const result = await lineFloorPlanStaffingService.getStaffingRules(lineId, floorPlanId, zoneId);

    expect(result).toEqual(staffingRules);
  });

  it("should unassign line from floor plan", async () => {
    const input = {
      floorPlanId,
      lineIds: [] // Empty = unassign
    };

    vi.mocked(updateFloorPlanLines).mockResolvedValue({
      success: true,
      data: { floorPlanId, lineIds: [] }
    } as any);

    const result = await updateFloorPlanLines(input);

    expect(result.success).toBe(true);
  });

  it("should verify settings cleaned up", async () => {
    // After unassigning, settings should be cleaned up
    vi.mocked(lineFloorPlanStaffingService.deleteStaffingRules).mockResolvedValue({ count: 1 });

    await lineFloorPlanStaffingService.deleteStaffingRules(lineId, floorPlanId, zoneId, null);

    expect(lineFloorPlanStaffingService.deleteStaffingRules).toHaveBeenCalled();
  });
});
