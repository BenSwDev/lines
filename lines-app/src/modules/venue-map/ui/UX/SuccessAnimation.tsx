/**
 * Success Animation Component
 * Visual feedback for successful actions
 */

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

export function SuccessAnimation({
  show,
  message,
  onComplete,
  duration = 2000,
  className = ""
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 300); // Fade out duration
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [show, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center pointer-events-none",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-4 p-8 bg-background/95 backdrop-blur-sm rounded-lg border shadow-2xl transition-all duration-300",
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        <div className="relative">
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-green-500/20 animate-ping",
              isAnimating ? "opacity-75" : "opacity-0"
            )}
          />
          <CheckCircle2
            className={cn(
              "h-16 w-16 text-green-500 relative z-10 transition-all duration-300",
              isAnimating ? "scale-100" : "scale-0"
            )}
          />
        </div>
        {message && (
          <p
            className={cn(
              "text-lg font-semibold text-foreground transition-all duration-300",
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
