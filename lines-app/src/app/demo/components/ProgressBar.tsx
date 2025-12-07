"use client";

import { motion } from "framer-motion";
import { progressBarVariants } from "../animations/slideTransitions";

interface ProgressBarProps {
  progress: number;
  currentSlide: number;
  totalSlides: number;
  className?: string;
}

/**
 * Progress bar component showing demo completion progress
 * Displays percentage and slide counter
 */
export function ProgressBar({ progress, currentSlide, totalSlides, className = "" }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2 flex items-center justify-between text-sm text-white/70">
        <span>
          Slide {currentSlide} of {totalSlides}
        </span>
        <span className="font-semibold text-white">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
          initial="initial"
          animate="animate"
          variants={progressBarVariants}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

