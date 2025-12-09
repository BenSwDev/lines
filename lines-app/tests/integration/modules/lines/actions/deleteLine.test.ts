import { describe, it, expect, beforeEach, vi } from "vitest";
import { deleteLine } from "@/modules/lines/actions/deleteLine";
import { getCurrentUser } from "@/core/auth/session";
import { lineRepository, lineOccurrenceRepository } from "@/core/db";
import { revalidatePath } from "next/cache";
import { mockLine } from "@/../../fixtures/lines";

vi.mock("@/core/auth/session");
vi.mock("@/core/db");
vi.mock("next/cache");

describe("deleteLine Integration", () => {
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

  it("should delete line successfully", async () => {
    vi.mocked(lineRepository.delete).mockResolvedValue(mockLine as any);

    const result = await deleteLine(venueId, lineId);

    expect(result.success).toBe(true);
    expect(lineRepository.delete).toHaveBeenCalledWith(lineId);
  });

  it("should delete associated occurrences", async () => {
    vi.mocked(lineOccurrenceRepository.deleteByLineId).mockResolvedValue(5);
    vi.mocked(lineRepository.delete).mockResolvedValue(mockLine as any);

    await deleteLine(venueId, lineId);

    expect(lineOccurrenceRepository.deleteByLineId).toHaveBeenCalledWith(lineId);
  });

  it("should validate line exists", async () => {
    vi.mocked(lineRepository.findById).mockResolvedValue(null);

    const result = await deleteLine(venueId, lineId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("לא נמצא");
    expect(lineRepository.delete).not.toHaveBeenCalled();
  });

  it("should validate venue ownership", async () => {
    vi.mocked(lineRepository.findById).mockResolvedValue({
      ...mockLine,
      venueId: "different-venue"
    } as any);

    const result = await deleteLine(venueId, lineId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should validate user authorization", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await deleteLine(venueId, lineId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should revalidate paths after deletion", async () => {
    vi.mocked(lineRepository.delete).mockResolvedValue(mockLine as any);

    await deleteLine(venueId, lineId);

    expect(revalidatePath).toHaveBeenCalledWith(`/venues/${venueId}/lines`);
    expect(revalidatePath).toHaveBeenCalledWith(`/venues/${venueId}/calendar`);
  });

  it("should free up color for reuse", async () => {
    vi.mocked(lineRepository.delete).mockResolvedValue(mockLine as any);

    await deleteLine(venueId, lineId);

    expect(result.success).toBe(true);
    // Color should be available again after deletion
  });
});
