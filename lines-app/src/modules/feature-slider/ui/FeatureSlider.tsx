"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeatureCard, FeatureSliderConfig } from "../types";

type FeatureSliderProps = {
  features: FeatureCard[];
  config?: FeatureSliderConfig;
  onAction?: (featureId: string, actionLabel: string) => void;
  onClose?: () => void;
  className?: string;
};

export function FeatureSlider({
  features,
  config = {},
  onAction,
  onClose,
  className
}: FeatureSliderProps) {
  const {
    autoPlay = false,
    autoPlayInterval = 5000,
    showDots = true,
    showArrows = true,
    slidesToShow = 1,
    infinite = true
  } = config;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= features.length - slidesToShow) {
        return infinite ? 0 : prev;
      }
      return prev + 1;
    });
  }, [features.length, slidesToShow, infinite]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return infinite ? features.length - slidesToShow : 0;
      }
      return prev - 1;
    });
  }, [features.length, slidesToShow, infinite]);

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, features.length - slidesToShow));
  };

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused || features.length <= slidesToShow) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isPaused, nextSlide, features.length, slidesToShow]);

  const visibleFeatures = features.slice(
    currentIndex,
    Math.min(currentIndex + slidesToShow, features.length)
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-background via-background to-muted/20 shadow-xl",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Close button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Slider content */}
      <div className="relative h-full min-h-[300px] p-6">
        <AnimatePresence mode="wait">
          {visibleFeatures.map((feature) => (
            <motion.div
              key={`${feature.id}-${currentIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-6 text-center",
                slidesToShow > 1 && "px-4"
              )}
            >
              {/* Icon/Badge */}
              <div className="relative">
                {feature.icon && (
                  <div
                    className={cn(
                      "flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg",
                      feature.gradient ? `bg-gradient-to-br ${feature.gradient}` : "bg-primary"
                    )}
                  >
                    {feature.icon}
                  </div>
                )}
                {feature.badge && (
                  <Badge
                    className={cn(
                      "absolute -right-2 -top-2",
                      feature.highlight && "bg-primary text-primary-foreground"
                    )}
                  >
                    {feature.badge}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="mx-auto max-w-md text-muted-foreground">{feature.description}</p>
              </div>

              {/* Actions */}
              {feature.actions && feature.actions.length > 0 && (
                <div className="flex gap-3">
                  {feature.actions.map((action, actionIdx) => (
                    <Button
                      key={actionIdx}
                      variant={action.variant || "default"}
                      onClick={() => {
                        action.onClick();
                        onAction?.(feature.id, action.label);
                      }}
                      className="gap-2"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      {showArrows && features.length > slidesToShow && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm hover:bg-background"
            onClick={prevSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm hover:bg-background"
            onClick={nextSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {showDots && features.length > slidesToShow && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {Array.from({ length: Math.ceil(features.length / slidesToShow) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx * slidesToShow)}
              className={cn(
                "h-2 rounded-full transition-all",
                Math.floor(currentIndex / slidesToShow) === idx
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
