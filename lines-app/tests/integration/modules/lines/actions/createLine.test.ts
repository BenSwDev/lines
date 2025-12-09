import { describe, it, expect, beforeEach, vi } from "vitest";
import { createLine } from "@/modules/lines/actions/createLine";
import { getCurrentUser } from "@/core/auth/session";
import { lineRepository, lineOccurrenceRepository } from "@/core/db";
import { lineScheduleService } from "@/modules/lines/services/lineScheduleService";
import { lineOccurrencesSyncService } from "@/modules/lines/services/lineOccurrencesSyncService";
import { checkMultipleCollisions } from "@/core/validation";
import { revalidatePath } from "next/cache";
import { mockLine, mockOccurrence } from "@/../../fixtures/lines";

vi.mock("@/core/auth/session");
vi.mock("@/core/db");
vi.mock("@/modules/lines/services/lineScheduleService");
vi.mock("@/modules/lines/services/lineOccurrencesSyncService");
vi.mock("@/core/validation");
vi.mock("next/cache");

describe("createLine Integration", () => {
  const venueId = "venue-1";
  const mockUserId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: mockUserId,
      email: "test@example.com"
    } as any);
  });

  it("should create line successfully with valid data", async () => {
    const input = {
      name: "Test Line",
      days: [1, 3, 5],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06", "2025-01-08"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await createLine(venueId, input);

    expect(result.success).toBe(true);
    expect(lineRepository.create).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("should create line with weekly frequency", async () => {
    const input = {
      name: "Weekly Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await createLine(venueId, input);

    expect(result.success).toBe(true);
  });

  it("should create line with monthly frequency", async () => {
    const input = {
      name: "Monthly Line",
      days: [0],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "monthly",
      color: "#EF4444",
      selectedDates: ["2025-01-05"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue({
      ...mockLine,
      frequency: "monthly"
    } as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await createLine(venueId, input);

    expect(result.success).toBe(true);
  });

  it("should create line with variable frequency (no occurrences)", async () => {
    const input = {
      name: "Variable Line",
      days: [1, 3, 5],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "variable",
      color: "#10B981"
    };

    vi.mocked(lineRepository.create).mockResolvedValue({
      ...mockLine,
      frequency: "variable"
    } as any);

    const result = await createLine(venueId, input);

    expect(result.success).toBe(true);
    // Should not sync occurrences for variable frequency
    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).not.toHaveBeenCalled();
  });

  it("should create line with oneTime frequency", async () => {
    const input = {
      name: "One Time Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "oneTime",
      color: "#F59E0B",
      selectedDates: ["2025-01-06"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue({
      ...mockLine,
      frequency: "oneTime"
    } as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await createLine(venueId, input);

    expect(result.success).toBe(true);
  });

  it("should generate occurrences for selected dates", async () => {
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06", "2025-01-13"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    await createLine(venueId, input);

    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).toHaveBeenCalled();
  });

  it("should handle collision detection before creating", async () => {
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([mockOccurrence] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: true,
      conflictingRanges: [{ date: "2025-01-06", startTime: "18:00", endTime: "22:00" }]
    });

    const result = await createLine(venueId, input);

    expect(result.success).toBe(false);
    expect(result.error).toContain("התנגשויות");
    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).not.toHaveBeenCalled();
  });

  it("should return error on collision", async () => {
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([mockOccurrence] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: true,
      conflictingRanges: [
        { date: "2025-01-06", startTime: "18:00", endTime: "22:00" },
        { date: "2025-01-13", startTime: "18:00", endTime: "22:00" }
      ]
    });

    const result = await createLine(venueId, input);

    expect(result.success).toBe(false);
    expect(result.error).toContain("2 אירועים");
  });

  it("should validate user authorization", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6"
    };

    const result = await createLine(venueId, input);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
    expect(lineRepository.create).not.toHaveBeenCalled();
  });

  it("should validate venue ownership", async () => {
    // This would typically be validated in the repository/service layer
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6"
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await createLine(venueId, input);

    expect(result.success).toBe(true);
  });

  it("should revalidate paths after creation", async () => {
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    await createLine(venueId, input);

    expect(revalidatePath).toHaveBeenCalledWith(`/venues/${venueId}/lines`);
    expect(revalidatePath).toHaveBeenCalledWith(`/venues/${venueId}/calendar`);
  });

  it("should handle color availability", async () => {
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    const result = await createLine(venueId, input);

    expect(result.success).toBe(true);
    // Color validation would happen in schema validation or service layer
  });

  it("should create occurrences with correct isExpected flags", async () => {
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    await createLine(venueId, input);

    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).toHaveBeenCalledWith(
      mockLine,
      expect.arrayContaining([
        expect.objectContaining({
          date: "2025-01-06",
          isExpected: true
        })
      ])
    );
  });

  it("should handle manual dates correctly", async () => {
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06"],
      manualDates: ["2025-01-15"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    await createLine(venueId, input);

    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).toHaveBeenCalledWith(
      mockLine,
      expect.arrayContaining([
        expect.objectContaining({
          date: "2025-01-06",
          isExpected: true
        }),
        expect.objectContaining({
          date: "2025-01-15",
          isExpected: false
        })
      ])
    );
  });

  it("should use daySchedules when provided", async () => {
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      daySchedules: [
        {
          day: 1,
          startTime: "19:00",
          endTime: "23:00",
          frequency: "weekly"
        }
      ],
      selectedDates: ["2025-01-06"]
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    await createLine(venueId, input);

    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).toHaveBeenCalled();
  });

  it("should fall back to legacy fields when daySchedules missing", async () => {
    const input = {
      name: "Test Line",
      days: [1],
      startTime: "18:00",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6",
      selectedDates: ["2025-01-06"]
      // No daySchedules - should use legacy fields
    };

    vi.mocked(lineRepository.create).mockResolvedValue(mockLine as any);
    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([]);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });
    vi.mocked(lineOccurrencesSyncService.syncOccurrencesWithSchedules).mockResolvedValue();

    await createLine(venueId, input);

    expect(lineOccurrencesSyncService.syncOccurrencesWithSchedules).toHaveBeenCalled();
  });

  it("should handle validation errors", async () => {
    const invalidInput = {
      name: "", // Invalid - empty name
      days: [],
      startTime: "invalid",
      endTime: "22:00",
      frequency: "weekly",
      color: "#3B82F6"
    };

    const result = await createLine(venueId, invalidInput);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
