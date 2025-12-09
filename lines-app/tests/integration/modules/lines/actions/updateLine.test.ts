import { describe, it, expect, beforeEach, vi } from "vitest";
import { updateLine } from "@/modules/lines/actions/updateLine";
import { getCurrentUser } from "@/core/auth/session";
import { lineRepository, lineOccurrenceRepository } from "@/core/db";
import { lineScheduleService } from "@/modules/lines/services/lineScheduleService";
import { lineOccurrencesSyncService } from "@/modules/lines/services/lineOccurrencesSyncService";
import { checkMultipleCollisions } from "@/core/validation";
import { revalidatePath } from "next/cache";
import { mockLine, mockOccurrence } from "../../../../fixtures/lines";

vi.mock("@/core/auth/session");
vi.mock("@/core/db");
vi.mock("@/modules/lines/services/lineScheduleService");
vi.mock("@/modules/lines/services/lineOccurrencesSyncService");
vi.mock("@/core/validation");
vi.mock("next/cache");

describe("updateLine Integration", () => {
  const venueId = "venue-1";
  const lineId = "line-1";
  const mockUserId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: mockUserId,
      email: "test@example.com"
    } as any);
    vi.mocked(lineRepository.findById).mockResolvedValue({ ...mockLine, venueId } as any);
  });

  it("should update line successfully", async () => {
    const input = {
      name: "Updated Line Name"
    };

    vi.mocked(lineRepository.update).mockResolvedValue({ ...mockLine, ...input } as any);

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
    expect(lineRepository.update).toHaveBeenCalled();
  });

  it("should update name only", async () => {
    const input = {
      name: "New Name"
    };

    vi.mocked(lineRepository.update).mockResolvedValue({ ...mockLine, name: input.name } as any);

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe(input.name);
  });

  it("should update schedule only", async () => {
    const input = {
      days: [2, 4],
      startTime: "19:00",
      endTime: "23:00"
    };

    vi.mocked(lineRepository.update).mockResolvedValue({ ...mockLine, ...input } as any);
    vi.mocked(lineOccurrenceRepository.findByLineId).mockResolvedValue([mockOccurrence] as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
  });

  it("should update color only", async () => {
    const input = {
      color: "#EF4444"
    };

    vi.mocked(lineRepository.update).mockResolvedValue({ ...mockLine, color: input.color } as any);

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
    expect(result.data?.color).toBe(input.color);
  });

  it("should update frequency (weekly to monthly)", async () => {
    const input = {
      frequency: "monthly"
    };

    vi.mocked(lineRepository.update).mockResolvedValue({
      ...mockLine,
      frequency: "monthly"
    } as any);
    vi.mocked(lineOccurrenceRepository.findByLineId).mockResolvedValue([mockOccurrence] as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
  });

  it("should update frequency to variable (clears occurrences)", async () => {
    const input = {
      frequency: "variable"
    };

    vi.mocked(lineRepository.update).mockResolvedValue({
      ...mockLine,
      frequency: "variable"
    } as any);

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
    // Should not regenerate occurrences for variable frequency
  });

  it("should regenerate occurrences when schedule changes", async () => {
    const input = {
      days: [1, 3, 5],
      startTime: "19:00"
    };

    vi.mocked(lineRepository.update).mockResolvedValue({ ...mockLine, ...input } as any);
    vi.mocked(lineOccurrenceRepository.findByLineId).mockResolvedValue([mockOccurrence] as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(lineScheduleService.generateSuggestions).mockReturnValue([
      "2025-01-06",
      "2025-01-08"
    ]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).toHaveBeenCalled();
  });

  it("should sync occurrences when selectedDates provided", async () => {
    const input = {
      selectedDates: ["2025-01-13", "2025-01-20"]
    };

    vi.mocked(lineRepository.update).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).toHaveBeenCalled();
  });

  it("should handle collision detection on update", async () => {
    const input = {
      selectedDates: ["2025-01-06"]
    };

    vi.mocked(lineRepository.update).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([mockOccurrence] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: true,
      conflictingRanges: [{ date: "2025-01-06", startTime: "18:00", endTime: "22:00" }]
    });

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(false);
    expect(result.error).toContain("התנגשויות");
  });

  it("should exclude current line from collision check", async () => {
    const input = {
      selectedDates: ["2025-01-06"]
    };

    const existingOccurrence = { ...mockOccurrence, lineId };

    vi.mocked(lineRepository.update).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([
      existingOccurrence
    ] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
    // Collision check should exclude current line
    expect(checkMultipleCollisions).toHaveBeenCalledWith(
      expect.any(Array),
      expect.arrayContaining([]) // Should exclude lineId occurrences
    );
  });

  it("should validate line exists", async () => {
    vi.mocked(lineRepository.findById).mockResolvedValue(null);

    const result = await updateLine(venueId, lineId, { name: "Updated" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("לא נמצא");
    expect(lineRepository.update).not.toHaveBeenCalled();
  });

  it("should validate venue ownership", async () => {
    vi.mocked(lineRepository.findById).mockResolvedValue({
      ...mockLine,
      venueId: "different-venue"
    } as any);

    const result = await updateLine(venueId, lineId, { name: "Updated" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should validate user authorization", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await updateLine(venueId, lineId, { name: "Updated" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should revalidate paths after update", async () => {
    const input = {
      name: "Updated Name"
    };

    vi.mocked(lineRepository.update).mockResolvedValue({ ...mockLine, ...input } as any);

    await updateLine(venueId, lineId, input);

    expect(revalidatePath).toHaveBeenCalledWith(`/venues/${venueId}/lines`);
    expect(revalidatePath).toHaveBeenCalledWith(`/venues/${venueId}/lines/${lineId}`);
    expect(revalidatePath).toHaveBeenCalledWith(`/venues/${venueId}/calendar`);
  });

  it("should preserve manual dates when updating schedule", async () => {
    const input = {
      days: [2, 4],
      manualDates: ["2025-01-15"]
    };

    vi.mocked(lineRepository.update).mockResolvedValue({ ...mockLine, days: [2, 4] } as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    await updateLine(venueId, lineId, input);

    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          date: "2025-01-15",
          isExpected: false
        })
      ])
    );
  });

  it("should handle partial updates correctly", async () => {
    const input = {
      name: "Partial Update"
    };

    vi.mocked(lineRepository.update).mockResolvedValue({ ...mockLine, name: input.name } as any);

    const result = await updateLine(venueId, lineId, input);

    expect(result.success).toBe(true);
    // Should not regenerate occurrences if schedule didn't change
  });
});
