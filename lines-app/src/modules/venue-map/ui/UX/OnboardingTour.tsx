/**
 * Onboarding Tour Component
 * Guided tour for new users
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector or data attribute
  position?: "top" | "bottom" | "left" | "right" | "center";
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string;
}

export function OnboardingTour({
  steps,
  onComplete,
  onSkip,
  storageKey = "venue-map-tour-completed"
}: OnboardingTourProps) {
  const { t } = useTranslations();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  // Check if tour was already completed
  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (completed === "true") {
      return;
    }
    setIsVisible(true);
  }, [storageKey]);

  // Find target element for current step
  useEffect(() => {
    if (!isVisible || currentStep >= steps.length) return;

    const step = steps[currentStep];
    if (!step.target) {
      setTargetElement(null);
      return;
    }

    // Try data attribute first
    let element = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement;
    
    // Fallback to CSS selector
    if (!element) {
      element = document.querySelector(step.target) as HTMLElement;
    }

    setTargetElement(element || null);
  }, [currentStep, steps, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, "true");
    setIsVisible(false);
    onSkip?.();
  };

  if (!isVisible || currentStep >= steps.length) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Calculate position for tooltip
  const getTooltipPosition = () => {
    if (!targetElement) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const position = step.position || "bottom";

    switch (position) {
      case "top":
        return {
          top: `${rect.top - 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translate(-50%, -100%)"
        };
      case "bottom":
        return {
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translateX(-50%)"
        };
      case "left":
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 10}px`,
          transform: "translate(-100%, -50%)"
        };
      case "right":
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 10}px`,
          transform: "translateY(-50%)"
        };
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleNext}
        aria-hidden="true"
      />

      {/* Highlight target element */}
      {targetElement && (
        <div
          className="fixed z-40 pointer-events-none border-2 border-primary rounded-lg shadow-lg"
          style={{
            top: `${targetElement.getBoundingClientRect().top + window.scrollY}px`,
            left: `${targetElement.getBoundingClientRect().left + window.scrollX}px`,
            width: `${targetElement.getBoundingClientRect().width}px`,
            height: `${targetElement.getBoundingClientRect().height}px`
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className="fixed z-50 max-w-sm p-6 shadow-xl"
        style={getTooltipPosition()}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </div>
            <div className="flex gap-2">
              {!isFirst && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                >
                  <ArrowRight className="h-4 w-4 ml-1" />
                  {t("common.previous") || "הקודם"}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
              >
                {isLast
                  ? t("common.finish") || "סיום"
                  : t("common.next") || "הבא"}
                {!isLast && <ArrowLeft className="h-4 w-4 mr-1" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

