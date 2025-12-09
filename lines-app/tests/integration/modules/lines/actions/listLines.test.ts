import { describe, it, expect, beforeEach, vi } from "vitest";
import { listLines } from "@/modules/lines/actions/listLines";
import { getCurrentUser } from "@/core/auth/session";
import { lineRepository } from "@/core/db";
import { mockLine, mockOccurrence } from "@/../../fixtures/lines";

vi.mock("@/core/auth/session");
vi.mock("@/core/db");

describe("listLines Integration", () => {
  const venueId = "venue-1";
  const mockUserId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: mockUserId,
      email: "test@example.com"
    } as any);
  });

  it("should list all lines for venue", async () => {
    const mockLines = [
      { ...mockLine, occurrences: [] },
      { ...mockLine, id: "line-2", name: "Line 2", occurrences: [] }
    ];

    vi.mocked(lineRepository.findByVenueId).mockResolvedValue(mockLines as any);

    const result = await listLines(venueId);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(lineRepository.findByVenueId).toHaveBeenCalledWith(venueId);
  });

  it("should include occurrences count", async () => {
    const mockLines = [
      {
        ...mockLine,
        occurrences: [mockOccurrence, { ...mockOccurrence, id: "occ-2" }]
      }
    ];

    vi.mocked(lineRepository.findByVenueId).mockResolvedValue(mockLines as any);

    const result = await listLines(venueId);

    expect(result.success).toBe(true);
    expect(result.data?.[0].occurrences).toHaveLength(2);
  });

  it("should include line metadata", async () => {
    const mockLines = [{ ...mockLine, occurrences: [] }];

    vi.mocked(lineRepository.findByVenueId).mockResolvedValue(mockLines as any);

    const result = await listLines(venueId);

    expect(result.success).toBe(true);
    expect(result.data?.[0]).toMatchObject({
      id: mockLine.id,
      name: mockLine.name,
      color: mockLine.color,
      frequency: mockLine.frequency
    });
  });

  it("should return empty array for venue with no lines", async () => {
    vi.mocked(lineRepository.findByVenueId).mockResolvedValue([]);

    const result = await listLines(venueId);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it("should validate user authorization", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await listLines(venueId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should sort lines correctly", async () => {
    const mockLines = [
      { ...mockLine, id: "line-2", createdAt: new Date("2025-01-02"), occurrences: [] },
      { ...mockLine, id: "line-1", createdAt: new Date("2025-01-01"), occurrences: [] }
    ];

    vi.mocked(lineRepository.findByVenueId).mockResolvedValue(mockLines as any);

    const result = await listLines(venueId);

    expect(result.success).toBe(true);
    // Should be sorted by createdAt desc
    expect(result.data?.[0].id).toBe("line-2");
  });
});
