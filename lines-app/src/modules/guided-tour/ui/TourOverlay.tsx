"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTour } from "./TourProvider";
import { getAllStepIds } from "../data/tourContent";
import { cn } from "@/lib/utils";

export function TourOverlay() {
  const { isActive, currentStep, prevStep, skipStep, stopTour, completeStep } =
    useTour();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopTour();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        // RTL: ArrowRight = next, ArrowLeft = prev
        const isRTL = document.documentElement.dir === "rtl";
        if ((isRTL && e.key === "ArrowRight") || (!isRTL && e.key === "ArrowLeft")) {
          e.preventDefault();
          completeStep();
        } else if ((isRTL && e.key === "ArrowLeft") || (!isRTL && e.key === "ArrowRight")) {
          e.preventDefault();
          prevStep();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, completeStep, prevStep, stopTour]);

  // Find and highlight target element
  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetElement(null);
      return;
    }

    if (currentStep.targetSelector) {
      const element = document.querySelector(currentStep.targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
        // Scroll element into view smoothly
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center"
          });
        }, 100);
        updateOverlayPosition(element);
      } else {
        // Element not found, show center tooltip
        setTargetElement(null);
      }
    } else {
      // No target selector, show center tooltip
      setTargetElement(null);
    }
  }, [isActive, currentStep]);

  // Update overlay position when element moves
  useEffect(() => {
    if (!targetElement) return;

    const observer = new ResizeObserver(() => {
      updateOverlayPosition(targetElement);
    });

    observer.observe(targetElement);
    window.addEventListener("scroll", () => updateOverlayPosition(targetElement), true);
    window.addEventListener("resize", () => updateOverlayPosition(targetElement));

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", () => updateOverlayPosition(targetElement), true);
      window.removeEventListener("resize", () => updateOverlayPosition(targetElement));
    };
  }, [targetElement]);

  const updateOverlayPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const highlightStyle: React.CSSProperties = {
      position: "fixed",
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      pointerEvents: "none",
      zIndex: 9998
    };
    setOverlayStyle(highlightStyle);
  };

  if (!isActive || !currentStep) return null;

  const position = currentStep.position || "center";
  const hasTarget = !!targetElement;

  // Calculate progress
  const allStepIds = getAllStepIds();
  const currentStepIndex = allStepIds.findIndex((id) => id === currentStep.id);
  const currentStepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 0;
  const totalSteps = allStepIds.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9997] pointer-events-none">
        {/* Dark overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70"
          onClick={stopTour}
        />

        {/* Highlight box for target element */}
        {hasTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={overlayStyle}
            className="border-4 border-primary rounded-lg shadow-2xl shadow-primary/50 bg-primary/10 animate-pulse"
          />
        )}

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className={cn(
            "absolute pointer-events-auto",
            // Center positioning
            position === "center" && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            // Top positioning with viewport protection
            position === "top" &&
              hasTarget &&
              "bottom-[calc(100%+20px)] left-1/2 -translate-x-1/2 rtl:right-1/2 rtl:left-auto rtl:translate-x-1/2 max-w-[calc(100vw-2rem)]",
            // Bottom positioning with viewport protection
            position === "bottom" &&
              hasTarget &&
              "top-[calc(100%+20px)] left-1/2 -translate-x-1/2 rtl:right-1/2 rtl:left-auto rtl:translate-x-1/2 max-w-[calc(100vw-2rem)]",
            // Left positioning with viewport protection
            position === "left" &&
              hasTarget &&
              "right-[calc(100%+20px)] top-1/2 -translate-y-1/2 rtl:left-[calc(100%+20px)] rtl:right-auto max-w-[calc(100vw-2rem)]",
            // Right positioning with viewport protection
            position === "right" &&
              hasTarget &&
              "left-[calc(100%+20px)] top-1/2 -translate-y-1/2 rtl:right-[calc(100%+20px)] rtl:left-auto max-w-[calc(100vw-2rem)]",
            // No target - center
            !hasTarget && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-card border-2 border-primary rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-[calc(100vw-2rem)] sm:w-[400px] rtl:text-right mx-4 sm:mx-0"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground">{currentStep.title}</h3>
                  {totalSteps > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {currentStepNumber}/{totalSteps}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={stopTour}
                className="h-8 w-8 flex-shrink-0"
                title="סגור (Esc)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-6 rtl:flex-row-reverse">
              <div className="flex gap-2 rtl:flex-row-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="gap-1 rtl:flex-row-reverse flex-1 sm:flex-initial"
                  disabled={!currentStep.prevStepId}
                  title={currentStep.prevStepId ? "הקודם (←)" : undefined}
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  <span className="hidden sm:inline">הקודם</span>
                </Button>
                {currentStep.skipable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipStep}
                    className="gap-1 rtl:flex-row-reverse flex-1 sm:flex-initial"
                  >
                    <SkipForward className="h-4 w-4" />
                    <span className="hidden sm:inline">דלג</span>
                  </Button>
                )}
              </div>
              <Button
                onClick={completeStep}
                size="sm"
                className="gap-1 rtl:flex-row-reverse flex-1 sm:flex-initial"
                title="הבא (→)"
              >
                <span className="hidden sm:inline">הבא</span>
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

