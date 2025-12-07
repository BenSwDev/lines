"use client";

import { useState, useCallback, useMemo } from "react";
import type { DemoFlow, DemoSlide } from "../utils/demoSchema";

/**
 * Hook for managing demo flow state and navigation
 * Handles slide transitions, branching logic, and progress tracking
 */
export function useDemoFlow(flow: DemoFlow) {
  const [currentSlideId, setCurrentSlideId] = useState<string>(flow.slides[0]?.id || "");
  const [visitedSlides, setVisitedSlides] = useState<Set<string>>(new Set([flow.slides[0]?.id || ""]));
  const [selectedBranches, setSelectedBranches] = useState<Record<string, string>>({});

  // Get current slide
  const currentSlide = useMemo(() => {
    return flow.slides.find((slide) => slide.id === currentSlideId);
  }, [flow.slides, currentSlideId]);

  // Calculate progress
  const progress = useMemo(() => {
    const currentIndex = flow.slides.findIndex((slide) => slide.id === currentSlideId);
    return currentIndex >= 0 ? ((currentIndex + 1) / flow.slides.length) * 100 : 0;
  }, [flow.slides, currentSlideId]);

  // Navigate to a specific slide
  const goToSlide = useCallback(
    (slideId: string) => {
      const slide = flow.slides.find((s) => s.id === slideId);
      if (slide) {
        setCurrentSlideId(slideId);
        setVisitedSlides((prev) => new Set([...prev, slideId]));
      }
    },
    [flow.slides]
  );

  // Navigate to next slide
  const goToNext = useCallback(() => {
    if (!currentSlide) return;

    // Handle question slides with branching
    if (currentSlide.type === "question") {
      const selectedOption = selectedBranches[currentSlide.id];
      if (selectedOption) {
        const option = currentSlide.options?.find((opt) => opt.id === selectedOption);
        if (option?.nextSlide) {
          goToSlide(option.nextSlide);
          return;
        }
      }
    }

    // Default next slide logic
    if (currentSlide.nextSlide) {
      goToSlide(currentSlide.nextSlide);
      return;
    }

    // Fallback: go to next slide in array
    const currentIndex = flow.slides.findIndex((slide) => slide.id === currentSlideId);
    if (currentIndex < flow.slides.length - 1) {
      goToSlide(flow.slides[currentIndex + 1].id);
    }
  }, [currentSlide, currentSlideId, flow.slides, goToSlide, selectedBranches]);

  // Navigate to previous slide
  const goToPrevious = useCallback(() => {
    const currentIndex = flow.slides.findIndex((slide) => slide.id === currentSlideId);
    if (currentIndex > 0) {
      goToSlide(flow.slides[currentIndex - 1].id);
    }
  }, [currentSlideId, flow.slides, goToSlide]);

  // Select a branch option (for question slides)
  const selectBranch = useCallback(
    (slideId: string, optionId: string) => {
      setSelectedBranches((prev) => ({ ...prev, [slideId]: optionId }));
      const slide = flow.slides.find((s) => s.id === slideId);
      if (slide && slide.type === "question") {
        const option = slide.options?.find((opt) => opt.id === optionId);
        if (option?.nextSlide) {
          // Auto-advance to selected branch
          setTimeout(() => {
            goToSlide(option.nextSlide);
          }, 500);
        }
      }
    },
    [flow.slides, goToSlide]
  );

  // Skip question slide
  const skipQuestion = useCallback(
    (slideId: string) => {
      const slide = flow.slides.find((s) => s.id === slideId);
      if (slide && slide.type === "question" && slide.skipTo) {
        goToSlide(slide.skipTo);
      }
    },
    [flow.slides, goToSlide]
  );

  // Reset demo
  const reset = useCallback(() => {
    setCurrentSlideId(flow.slides[0]?.id || "");
    setVisitedSlides(new Set([flow.slides[0]?.id || ""]));
    setSelectedBranches({});
  }, [flow.slides]);

  // Check if slide is visited
  const isVisited = useCallback(
    (slideId: string) => {
      return visitedSlides.has(slideId);
    },
    [visitedSlides]
  );

  // Get slide by ID
  const getSlide = useCallback(
    (slideId: string): DemoSlide | undefined => {
      return flow.slides.find((slide) => slide.id === slideId);
    },
    [flow.slides]
  );

  return {
    currentSlide,
    currentSlideId,
    progress,
    visitedSlides,
    selectedBranches,
    goToSlide,
    goToNext,
    goToPrevious,
    selectBranch,
    skipQuestion,
    reset,
    isVisited,
    getSlide,
    totalSlides: flow.slides.length,
    currentIndex: flow.slides.findIndex((slide) => slide.id === currentSlideId),
  };
}

