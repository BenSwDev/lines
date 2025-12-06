/**
 * History Manager for Undo/Redo functionality
 * Provides a complete history stack with configurable max size
 */

export interface HistoryState<T> {
  elements: T[];
  timestamp: number;
}

export class HistoryManager<T> {
  private history: HistoryState<T>[] = [];
  private currentIndex: number = -1;
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  /**
   * Add a new state to history
   */
  push(state: T[]): void {
    // Remove any states after current index (when undoing and then making new changes)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push({
      elements: JSON.parse(JSON.stringify(state)), // Deep clone
      timestamp: Date.now()
    });

    // Limit history size
    if (this.history.length > this.maxSize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Undo - go back one step
   */
  undo(): T[] | null {
    if (this.canUndo()) {
      this.currentIndex--;
      return JSON.parse(JSON.stringify(this.history[this.currentIndex].elements)); // Deep clone
    }
    return null;
  }

  /**
   * Redo - go forward one step
   */
  redo(): T[] | null {
    if (this.canRedo()) {
      this.currentIndex++;
      return JSON.parse(JSON.stringify(this.history[this.currentIndex].elements)); // Deep clone
    }
    return null;
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  getCurrent(): T[] | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return JSON.parse(JSON.stringify(this.history[this.currentIndex].elements)); // Deep clone
    }
    return null;
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history size
   */
  getSize(): number {
    return this.history.length;
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

