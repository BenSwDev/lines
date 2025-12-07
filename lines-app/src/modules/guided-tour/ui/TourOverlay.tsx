"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTour } from "./TourProvider";
import { cn } from "@/lib/utils";

export function TourOverlay() {
  const { isActive, currentStep, prevStep, skipStep, stopTour, completeStep } =
    useTour();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

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
            className="border-4 border-primary rounded-lg shadow-2xl shadow-primary/50 bg-primary/10"
          />
        )}

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className={cn(
            "absolute pointer-events-auto",
            position === "center" && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            position === "top" &&
              hasTarget &&
              "bottom-[calc(100%+20px)] left-1/2 -translate-x-1/2 rtl:right-1/2 rtl:left-auto rtl:translate-x-1/2",
            position === "bottom" &&
              hasTarget &&
              "top-[calc(100%+20px)] left-1/2 -translate-x-1/2 rtl:right-1/2 rtl:left-auto rtl:translate-x-1/2",
            position === "left" &&
              hasTarget &&
              "right-[calc(100%+20px)] top-1/2 -translate-y-1/2 rtl:left-[calc(100%+20px)] rtl:right-auto",
            position === "right" &&
              hasTarget &&
              "left-[calc(100%+20px)] top-1/2 -translate-y-1/2 rtl:right-[calc(100%+20px)] rtl:left-auto",
            !hasTarget && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-card border-2 border-primary rounded-xl shadow-2xl p-6 max-w-md w-[90vw] sm:w-[400px] rtl:text-right"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">{currentStep.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={stopTour}
                className="h-8 w-8 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 mt-6 rtl:flex-row-reverse">
              <div className="flex gap-2 rtl:flex-row-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="gap-1 rtl:flex-row-reverse"
                  disabled={!currentStep.prevStepId}
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  הקודם
                </Button>
                {currentStep.skipable && (
                  <Button variant="ghost" size="sm" onClick={skipStep} className="gap-1 rtl:flex-row-reverse">
                    <SkipForward className="h-4 w-4" />
                    דלג
                  </Button>
                )}
              </div>
              <Button onClick={completeStep} size="sm" className="gap-1 rtl:flex-row-reverse">
                הבא
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

