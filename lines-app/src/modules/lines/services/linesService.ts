import { lineRepository } from "@/core/db";
import { LINE_COLOR_PALETTE, MAX_COLORS_PER_VENUE } from "@/core/config/constants";
import { isOvernightShift } from "@/core/validation";

export class LinesService {
  /**
   * Get available colors for a venue
   */
  async getAvailableColors(venueId: string): Promise<string[]> {
    const usedColors = await lineRepository.findUsedColorsByVenueId(venueId);

    return LINE_COLOR_PALETTE.filter((color) => {
      return !usedColors.includes(color);
    });
  }

  /**
   * Validate if a color is available
   */
  async isColorAvailable(venueId: string, color: string, excludeLineId?: string): Promise<boolean> {
    return lineRepository.isColorAvailable(venueId, color, excludeLineId);
  }

  /**
   * Get next available color (or throw if palette exhausted)
   */
  async getNextAvailableColor(venueId: string): Promise<string> {
    const available = await this.getAvailableColors(venueId);

    if (available.length === 0) {
      throw new Error("כל הצבעים תפוסים. מחק ליין קיים כדי לפנות צבע");
    }

    return available[0];
  }

  /**
   * Check if event is overnight shift
   */
  isOvernightShift(startTime: string, endTime: string): boolean {
    return isOvernightShift(startTime, endTime);
  }

  /**
   * Count lines for a venue
   */
  async countLines(venueId: string): Promise<number> {
    return lineRepository.countByVenueId(venueId);
  }

  /**
   * Validate that color palette limit is not exceeded
   */
  async canCreateNewLine(venueId: string): Promise<boolean> {
    const count = await this.countLines(venueId);
    return count < MAX_COLORS_PER_VENUE;
  }
}

export const linesService = new LinesService();
