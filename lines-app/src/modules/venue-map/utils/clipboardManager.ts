/**
 * Clipboard Manager for Copy/Paste functionality
 * Handles copying and pasting elements with proper ID regeneration
 */

export interface ClipboardData<T> {
  elements: T[];
  timestamp: number;
}

export class ClipboardManager<T extends { id: string; x: number; y: number }> {
  private clipboard: ClipboardData<T> | null = null;

  /**
   * Copy elements to clipboard
   */
  copy(elements: T[]): void {
    if (elements.length === 0) return;

    this.clipboard = {
      elements: JSON.parse(JSON.stringify(elements)), // Deep clone
      timestamp: Date.now()
    };
  }

  /**
   * Paste elements from clipboard with new IDs
   */
  paste(offset: { x: number; y: number } = { x: 20, y: 20 }): T[] | null {
    if (!this.clipboard || this.clipboard.elements.length === 0) {
      return null;
    }

    // Generate new IDs and apply offset
    const pasted = this.clipboard.elements.map((element) => {
      const newId = `${element.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        ...element,
        id: newId,
        x: element.x + offset.x,
        y: element.y + offset.y
      };
    });

    return pasted;
  }

  /**
   * Duplicate elements (copy + paste in one operation)
   */
  duplicate(elements: T[], offset: { x: number; y: number } = { x: 20, y: 20 }): T[] {
    if (elements.length === 0) return [];

    // Generate new IDs and apply offset
    const duplicated = elements.map((element) => {
      const newId = `${element.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        ...element,
        id: newId,
        x: element.x + offset.x,
        y: element.y + offset.y
      };
    });

    return duplicated;
  }

  /**
   * Check if clipboard has data
   */
  hasData(): boolean {
    return this.clipboard !== null && this.clipboard.elements.length > 0;
  }

  /**
   * Clear clipboard
   */
  clear(): void {
    this.clipboard = null;
  }

  /**
   * Get clipboard size
   */
  getSize(): number {
    return this.clipboard?.elements.length || 0;
  }
}
