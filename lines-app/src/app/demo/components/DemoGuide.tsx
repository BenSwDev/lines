"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useDemoFlow } from "../hooks/useDemoFlow";
import { useAutoAdvance } from "../hooks/useAutoAdvance";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { Slide } from "./Slide";
import { ProgressBar } from "./ProgressBar";
import { slideVariants, slideTransition } from "../animations/slideTransitions";
import type { DemoFlow } from "../utils/demoSchema";
import "../styles/demo.css";

interface DemoGuideProps {
  flow: DemoFlow;
}

/**
 * Main demo guide component
 * Orchestrates the entire interactive demo experience
 */
export function DemoGuide({ flow }: DemoGuideProps) {
  const [direction, setDirection] = useState(0);
  const {
    currentSlide,
    currentSlideId,
    visitedSlides,
    selectedBranches,
    goToNext,
    goToPrevious,
    goToSlide,
    selectBranch,
    skipQuestion,
    reset,
    totalSlides,
    currentIndex,
  } = useDemoFlow(flow);

  const { progress: progressPercentage, slideNumber, canGoNext, canGoPrevious } = useDemoProgress({
    currentIndex,
    totalSlides,
    visitedSlides,
  });

  // Auto-advance logic
  useAutoAdvance({
    slide: currentSlide,
    enabled: flow.metadata.autoAdvance ?? true,
    defaultDelay: flow.metadata.autoAdvanceDelay ?? 5000,
    onAdvance: goToNext,
    pauseOnHover: true,
  });

  const handleNext = () => {
    setDirection(1);
    goToNext();
  };

  const handlePrevious = () => {
    setDirection(-1);
    goToPrevious();
  };

  const handleSelectBranch = (optionId: string) => {
    if (currentSlide && currentSlide.type === "question") {
      selectBranch(currentSlide.id, optionId);
    }
  };

  const handleSkipQuestion = () => {
    if (currentSlide && currentSlide.type === "question") {
      skipQuestion(currentSlide.id);
    }
  };

  if (!currentSlide) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <p>No slides available</p>
      </div>
    );
  }

  const gradientClass = currentSlide.gradient || "from-purple-500 via-pink-500 to-orange-500";

  return (
    <div className="demo-container relative min-h-screen overflow-hidden" data-demo-container>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-20`} />
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Animated background elements */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header with progress */}
        <div className="container mx-auto px-4 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <ProgressBar
              progress={progressPercentage}
              currentSlide={slideNumber}
              totalSlides={totalSlides}
            />
          </div>
        </div>

        {/* Slide content */}
        <div className="flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlideId}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Slide
                slide={currentSlide}
                selectedBranch={currentSlide.type === "question" ? selectedBranches[currentSlide.id] : undefined}
                onSelectBranch={handleSelectBranch}
                onSkipQuestion={handleSkipQuestion}
                direction={direction}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation controls */}
        <div className="container mx-auto px-4 pb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={`flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white backdrop-blur-sm transition-all ${
                canGoPrevious
                  ? "hover:bg-white/20 hover:scale-105"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            <div className="flex gap-2">
              {flow.slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    goToSlide(slide.id);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-white"
                      : index < currentIndex
                        ? "w-2 bg-white/50"
                        : "w-2 bg-white/20"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!canGoNext || currentSlide.type === "question"}
              className={`flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white backdrop-blur-sm transition-all ${
                canGoNext && currentSlide.type !== "question"
                  ? "hover:bg-white/20 hover:scale-105"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

