/**
 * Guided Tour Service
 *
 * Business logic for managing tour state, progress, and navigation
 */

import type { TourStep, TourStepId, TourProgress } from "../types";

const STORAGE_KEY = "lines-tour-progress";

/**
 * Load tour progress from localStorage
 */
export function loadTourProgress(): TourProgress | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as TourProgress;
  } catch {
    return null;
  }
}

/**
 * Save tour progress to localStorage
 */
export function saveTourProgress(progress: TourProgress): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save tour progress:", error);
  }
}

/**
 * Reset tour progress
 */
export function resetTourProgress(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to reset tour progress:", error);
  }
}

/**
 * Check if step is completed
 */
export function isStepCompleted(stepId: TourStepId, progress: TourProgress | null): boolean {
  if (!progress) return false;
  return progress.completedSteps.includes(stepId);
}

/**
 * Mark step as completed
 */
export function markStepCompleted(stepId: TourStepId, progress: TourProgress | null): TourProgress {
  const newProgress: TourProgress = progress || {
    currentStepId: null,
    completedSteps: [],
    currentPageId: null,
    startedAt: Date.now(),
    completedAt: null
  };

  if (!newProgress.completedSteps.includes(stepId)) {
    newProgress.completedSteps.push(stepId);
  }

  newProgress.currentStepId = stepId;
  saveTourProgress(newProgress);
  return newProgress;
}

/**
 * Get next step ID
 */
export function getNextStepId(currentStep: TourStep, allSteps: TourStep[]): TourStepId | null {
  if (currentStep.nextStepId) {
    return currentStep.nextStepId;
  }

  // Find next step in same page
  const currentIndex = allSteps.findIndex((s) => s.id === currentStep.id);
  if (currentIndex >= 0 && currentIndex < allSteps.length - 1) {
    return allSteps[currentIndex + 1].id;
  }

  return null;
}

/**
 * Get previous step ID
 */
export function getPrevStepId(currentStep: TourStep, allSteps: TourStep[]): TourStepId | null {
  if (currentStep.prevStepId) {
    return currentStep.prevStepId;
  }

  // Find previous step in same page
  const currentIndex = allSteps.findIndex((s) => s.id === currentStep.id);
  if (currentIndex > 0) {
    return allSteps[currentIndex - 1].id;
  }

  return null;
}

/**
 * Check if tour is completed
 */
export function isTourCompleted(progress: TourProgress | null, totalSteps: number): boolean {
  if (!progress) return false;
  return progress.completedSteps.length >= totalSteps;
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(progress: TourProgress | null, totalSteps: number): number {
  if (!progress || totalSteps === 0) return 0;
  return Math.round((progress.completedSteps.length / totalSteps) * 100);
}
