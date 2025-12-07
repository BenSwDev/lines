"use client";

import { useMemo } from "react";

interface UseDemoProgressOptions {
  currentIndex: number;
  totalSlides: number;
  visitedSlides: Set<string>;
}

/**
 * Hook for calculating and managing demo progress
 * Provides progress percentage, completion status, and navigation helpers
 */
export function useDemoProgress({ currentIndex, totalSlides, visitedSlides }: UseDemoProgressOptions) {
  const progress = useMemo(() => {
    if (totalSlides === 0) return 0;
    return Math.round(((currentIndex + 1) / totalSlides) * 100);
  }, [currentIndex, totalSlides]);

  const completionPercentage = useMemo(() => {
    if (totalSlides === 0) return 0;
    return Math.round((visitedSlides.size / totalSlides) * 100);
  }, [visitedSlides.size, totalSlides]);

  const isFirstSlide = useMemo(() => {
    return currentIndex === 0;
  }, [currentIndex]);

  const isLastSlide = useMemo(() => {
    return currentIndex === totalSlides - 1;
  }, [currentIndex, totalSlides]);

  const canGoNext = useMemo(() => {
    return !isLastSlide;
  }, [isLastSlide]);

  const canGoPrevious = useMemo(() => {
    return !isFirstSlide;
  }, [isFirstSlide]);

  const slideNumber = useMemo(() => {
    return currentIndex + 1;
  }, [currentIndex]);

  return {
    progress,
    completionPercentage,
    isFirstSlide,
    isLastSlide,
    canGoNext,
    canGoPrevious,
    slideNumber,
    totalSlides,
    visitedCount: visitedSlides.size,
  };
}

