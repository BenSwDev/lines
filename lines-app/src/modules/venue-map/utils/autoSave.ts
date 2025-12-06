/**
 * Auto-save utility with debouncing
 * Automatically saves changes after a delay
 */

export type SaveFunction<T> = (data: T) => Promise<void> | void;

export class AutoSaveManager<T> {
  private saveFunction: SaveFunction<T>;
  private delay: number;
  private timeoutId: NodeJS.Timeout | null = null;
  private lastSaved: T | null = null;
  private isSaving: boolean = false;

  constructor(saveFunction: SaveFunction<T>, delay: number = 2000) {
    this.saveFunction = saveFunction;
    this.delay = delay;
  }

  /**
   * Schedule a save operation
   */
  schedule(data: T): void {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Set new timeout
    this.timeoutId = setTimeout(async () => {
      if (this.isSaving) return;

      try {
        this.isSaving = true;
        await this.saveFunction(data);
        this.lastSaved = JSON.parse(JSON.stringify(data)); // Deep clone
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        this.isSaving = false;
      }
    }, this.delay);
  }

  /**
   * Force immediate save
   */
  async forceSave(data: T): Promise<void> {
    // Clear any pending saves
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.isSaving) return;

    try {
      this.isSaving = true;
      await this.saveFunction(data);
      this.lastSaved = JSON.parse(JSON.stringify(data)); // Deep clone
    } catch (error) {
      console.error("Force save failed:", error);
      throw error;
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Cancel pending save
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Check if currently saving
   */
  getIsSaving(): boolean {
    return this.isSaving;
  }

  /**
   * Get last saved data
   */
  getLastSaved(): T | null {
    return this.lastSaved;
  }

  /**
   * Check if data has changed since last save
   */
  hasChanged(data: T): boolean {
    if (!this.lastSaved) return true;
    return JSON.stringify(data) !== JSON.stringify(this.lastSaved);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.cancel();
    this.lastSaved = null;
    this.isSaving = false;
  }
}
