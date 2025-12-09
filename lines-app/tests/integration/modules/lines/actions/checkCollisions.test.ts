import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkLineCollisions } from "@/modules/lines/actions/checkCollisions";
import { getCurrentUser } from "@/core/auth/session";
import { lineOccurrenceRepository } from "@/core/db";
import { checkMultipleCollisions } from "@/core/validation";
import { mockOccurrence } from "@/../../fixtures/lines";

vi.mock("@/core/auth/session");
vi.mock("@/core/db");
vi.mock("@/core/validation");

describe("checkLineCollisions Integration", () => {
  const venueId = "venue-1";
  const mockUserId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: mockUserId,
      email: "test@example.com"
    } as any);
  });

  it("should detect overlapping occurrences", async () => {
    const newRanges = [{ date: "2025-01-06", startTime: "18:00", endTime: "22:00" }];

    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([mockOccurrence] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: true,
      conflictingRanges: [{ date: "2025-01-06", startTime: "18:00", endTime: "22:00" }]
    });

    const result = await checkLineCollisions(venueId, newRanges);

    expect(result.hasCollision).toBe(true);
    expect(result.conflictingRanges).toHaveLength(1);
  });

  it("should detect same time collisions", async () => {
    const newRanges = [{ date: "2025-01-06", startTime: "18:00", endTime: "22:00" }];

    const existingOccurrence = {
      ...mockOccurrence,
      date: "2025-01-06",
      startTime: "18:00",
      endTime: "22:00"
    };

    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([
      existingOccurrence
    ] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: true,
      conflictingRanges: [newRanges[0]]
    });

    const result = await checkLineCollisions(venueId, newRanges);

    expect(result.hasCollision).toBe(true);
  });

  it("should detect partial overlaps", async () => {
    const newRanges = [{ date: "2025-01-06", startTime: "19:00", endTime: "23:00" }];

    const existingOccurrence = {
      ...mockOccurrence,
      date: "2025-01-06",
      startTime: "18:00",
      endTime: "22:00"
    };

    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([
      existingOccurrence
    ] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: true,
      conflictingRanges: [newRanges[0]]
    });

    const result = await checkLineCollisions(venueId, newRanges);

    expect(result.hasCollision).toBe(true);
  });

  it("should detect overnight shift collisions", async () => {
    const newRanges = [{ date: "2025-01-06", startTime: "22:00", endTime: "02:00" }];

    const existingOccurrence = {
      ...mockOccurrence,
      date: "2025-01-06",
      startTime: "23:00",
      endTime: "03:00"
    };

    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([
      existingOccurrence
    ] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: true,
      conflictingRanges: [newRanges[0]]
    });

    const result = await checkLineCollisions(venueId, newRanges);

    expect(result.hasCollision).toBe(true);
  });

  it("should return no collision for non-overlapping times", async () => {
    const newRanges = [{ date: "2025-01-06", startTime: "09:00", endTime: "12:00" }];

    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([mockOccurrence] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });

    const result = await checkLineCollisions(venueId, newRanges);

    expect(result.hasCollision).toBe(false);
    expect(result.conflictingRanges).toHaveLength(0);
  });

  it("should handle multiple collisions", async () => {
    const newRanges = [
      { date: "2025-01-06", startTime: "18:00", endTime: "22:00" },
      { date: "2025-01-08", startTime: "18:00", endTime: "22:00" }
    ];

    const existingOccurrences = [
      { ...mockOccurrence, date: "2025-01-06" },
      { ...mockOccurrence, id: "occ-2", date: "2025-01-08" }
    ];

    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue(existingOccurrences as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: true,
      conflictingRanges: newRanges
    });

    const result = await checkLineCollisions(venueId, newRanges);

    expect(result.hasCollision).toBe(true);
    expect(result.conflictingRanges).toHaveLength(2);
  });

  it("should exclude inactive occurrences", async () => {
    const newRanges = [{ date: "2025-01-06", startTime: "18:00", endTime: "22:00" }];

    const inactiveOccurrence = {
      ...mockOccurrence,
      isActive: false
    };

    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([
      inactiveOccurrence
    ] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: false,
      conflictingRanges: []
    });

    const result = await checkLineCollisions(venueId, newRanges);

    expect(result.hasCollision).toBe(false);
  });

  it("should return collision details", async () => {
    const newRanges = [{ date: "2025-01-06", startTime: "18:00", endTime: "22:00" }];

    vi.mocked(lineOccurrenceRepository.findByVenueId).mockResolvedValue([mockOccurrence] as any);
    vi.mocked(checkMultipleCollisions).mockReturnValue({
      hasCollision: true,
      conflictingRanges: [
        {
          date: "2025-01-06",
          startTime: "18:00",
          endTime: "22:00",
          lineId: "line-1",
          lineName: "Existing Line"
        }
      ]
    });

    const result = await checkLineCollisions(venueId, newRanges);

    expect(result.hasCollision).toBe(true);
    expect(result.conflictingRanges[0]).toHaveProperty("date");
    expect(result.conflictingRanges[0]).toHaveProperty("startTime");
    expect(result.conflictingRanges[0]).toHaveProperty("endTime");
  });
});
