import { describe, it, expect, beforeEach, vi } from "vitest";
import { getLine } from "@/modules/lines/actions/getLine";
import { getCurrentUser } from "@/core/auth/session";
import { lineRepository } from "@/core/db";
import { mockLine, mockOccurrence } from "../../../../fixtures/lines";

vi.mock("@/core/auth/session");
vi.mock("@/core/db");

describe("getLine Integration", () => {
  const venueId = "venue-1";
  const lineId = "line-1";
  const mockUserId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: mockUserId,
      email: "test@example.com"
    } as any);
  });

  it("should return line with full details", async () => {
    const mockLineWithOccurrences = {
      ...mockLine,
      occurrences: [mockOccurrence]
    };

    vi.mocked(lineRepository.findById).mockResolvedValue(mockLineWithOccurrences as any);

    const result = await getLine(venueId, lineId);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockLineWithOccurrences);
    expect(lineRepository.findById).toHaveBeenCalledWith(lineId);
  });

  it("should include all occurrences", async () => {
    const mockLineWithOccurrences = {
      ...mockLine,
      occurrences: [
        mockOccurrence,
        { ...mockOccurrence, id: "occ-2", date: "2025-01-08" },
        { ...mockOccurrence, id: "occ-3", date: "2025-01-13" }
      ]
    };

    vi.mocked(lineRepository.findById).mockResolvedValue(mockLineWithOccurrences as any);

    const result = await getLine(venueId, lineId);

    expect(result.success).toBe(true);
    expect(result.data?.occurrences).toHaveLength(3);
  });

  it("should validate line exists", async () => {
    vi.mocked(lineRepository.findById).mockResolvedValue(null);

    const result = await getLine(venueId, lineId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("לא נמצא");
  });

  it("should validate venue ownership", async () => {
    vi.mocked(lineRepository.findById).mockResolvedValue({
      ...mockLine,
      venueId: "different-venue"
    } as any);

    const result = await getLine(venueId, lineId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should validate user authorization", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await getLine(venueId, lineId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should return error for non-existent line", async () => {
    vi.mocked(lineRepository.findById).mockResolvedValue(null);

    const result = await getLine(venueId, "non-existent");

    expect(result.success).toBe(false);
    expect(result.error).toContain("לא נמצא");
  });
});
