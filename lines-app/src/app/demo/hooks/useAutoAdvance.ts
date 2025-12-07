"use client";

import { useEffect, useRef, useCallback } from "react";
import type { DemoSlide } from "../utils/demoSchema";

interface UseAutoAdvanceOptions {
  slide: DemoSlide | undefined;
  enabled: boolean;
  defaultDelay: number;
  onAdvance: () => void;
  pauseOnHover?: boolean;
}

/**
 * Hook for auto-advancing slides
 * Handles timing, pause/resume, and cleanup
 */
export function useAutoAdvance({
  slide,
  enabled,
  defaultDelay,
  onAdvance,
  pauseOnHover = true,
}: UseAutoAdvanceOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!slide || !enabled || isPausedRef.current) return;

    clearTimer();

    const delay = slide.duration || slide.autoAdvance ? defaultDelay : 0;

    if (delay > 0 && slide.autoAdvance !== false) {
      timeoutRef.current = setTimeout(() => {
        if (!isPausedRef.current) {
          onAdvance();
        }
      }, delay);
    }
  }, [slide, enabled, defaultDelay, onAdvance, clearTimer]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    startTimer();
  }, [startTimer]);

  // Start timer when slide changes
  useEffect(() => {
    if (enabled && slide?.autoAdvance !== false) {
      startTimer();
    } else {
      clearTimer();
    }

    return () => {
      clearTimer();
    };
  }, [slide?.id, enabled, slide?.autoAdvance, startTimer, clearTimer]);

  // Handle pause on hover
  useEffect(() => {
    if (!pauseOnHover || !enabled) return;

    const handleMouseEnter = () => pause();
    const handleMouseLeave = () => resume();

    const container = document.querySelector("[data-demo-container]");
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover, enabled, pause, resume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    pause,
    resume,
    isPaused: isPausedRef.current,
  };
}

