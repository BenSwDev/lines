"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { TourStep, TourStepId, TourPageId, TourProgress } from "../types";
import {
  loadTourProgress,
  saveTourProgress,
  markStepCompleted,
  getNextStepId,
  getPrevStepId,
  isTourCompleted
} from "../services/tourService";
import { tourSteps, getAllStepIds, getStepById } from "../data/tourContent";

interface TourContextValue {
  // State
  isActive: boolean;
  currentStep: TourStep | null;
  progress: TourProgress | null;
  isCompleted: boolean;

  // Actions
  startTour: (pageId?: TourPageId) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepId: TourStepId) => void;
  skipStep: () => void;
  completeStep: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

interface TourProviderProps {
  children: React.ReactNode;
  autoStart?: boolean;
  pageId?: TourPageId;
}

export function TourProvider({ children, autoStart = false, pageId }: TourProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<TourStepId | null>(null);
  const [progress, setProgress] = useState<TourProgress | null>(null);

  // Load progress on mount
  useEffect(() => {
    const saved = loadTourProgress();
    setProgress(saved);

    if (autoStart && pageId) {
      // Auto-start tour for specific page
      const pageSteps = tourSteps.filter((s) => s.pageId === pageId);
      if (pageSteps.length > 0) {
        const firstStep = pageSteps[0];
        startTour(pageId);
        setCurrentStepId(firstStep.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, pageId]);

  const startTour = useCallback(
    (targetPageId?: TourPageId) => {
      const targetPage = targetPageId || pageId;
      if (!targetPage) return;

      const pageSteps = tourSteps.filter((s) => s.pageId === targetPage);
      if (pageSteps.length === 0) return;

      const firstStep = pageSteps[0];
      const newProgress: TourProgress = {
        currentStepId: firstStep.id,
        completedSteps: [],
        currentPageId: targetPage,
        startedAt: Date.now(),
        completedAt: null
      };

      setProgress(newProgress);
      saveTourProgress(newProgress);
      setCurrentStepId(firstStep.id);
      setIsActive(true);
    },
    [pageId]
  );

  const stopTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepId(null);
  }, []);

  const nextStep = useCallback(() => {
    if (!currentStepId) return;

    const currentStep = getStepById(currentStepId);
    if (!currentStep) return;

    const nextId = getNextStepId(currentStep, tourSteps);
    if (!nextId) {
      // Tour completed
      if (progress) {
        const completed: TourProgress = {
          ...progress,
          completedAt: Date.now()
        };
        setProgress(completed);
        saveTourProgress(completed);
      }
      stopTour();
      return;
    }

    setCurrentStepId(nextId);
    if (progress) {
      const updated: TourProgress = {
        ...progress,
        currentStepId: nextId
      };
      setProgress(updated);
      saveTourProgress(updated);
    }
  }, [currentStepId, progress, stopTour]);

  const prevStep = useCallback(() => {
    if (!currentStepId) return;

    const currentStep = getStepById(currentStepId);
    if (!currentStep) return;

    const prevId = getPrevStepId(currentStep, tourSteps);
    if (prevId) {
      setCurrentStepId(prevId);
      if (progress) {
        const updated: TourProgress = {
          ...progress,
          currentStepId: prevId
        };
        setProgress(updated);
        saveTourProgress(updated);
      }
    }
  }, [currentStepId, progress]);

  const goToStep = useCallback(
    (stepId: TourStepId) => {
      const step = getStepById(stepId);
      if (!step) return;

      setCurrentStepId(stepId);
      setIsActive(true);
      if (progress) {
        const updated: TourProgress = {
          ...progress,
          currentStepId: stepId,
          currentPageId: step.pageId
        };
        setProgress(updated);
        saveTourProgress(updated);
      }
    },
    [progress]
  );

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const completeStep = useCallback(() => {
    if (!currentStepId) return;

    const updated = markStepCompleted(currentStepId, progress);
    setProgress(updated);

    // Auto-advance to next step after a short delay
    setTimeout(() => {
      nextStep();
    }, 500);
  }, [currentStepId, progress, nextStep]);

  const resetTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepId(null);
    setProgress(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lines-tour-progress");
    }
  }, []);

  const currentStep: TourStep | null = currentStepId ? getStepById(currentStepId) || null : null;
  const allStepIds = getAllStepIds();
  const isCompleted = isTourCompleted(progress, allStepIds.length);

  const value: TourContextValue = {
    isActive,
    currentStep,
    progress,
    isCompleted,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    goToStep,
    skipStep,
    completeStep,
    resetTour
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within TourProvider");
  }
  return context;
}
