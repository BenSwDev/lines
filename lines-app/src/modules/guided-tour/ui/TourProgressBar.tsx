"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTour } from "./TourProvider";
import { getAllStepIds } from "../data/tourContent";
import { getCompletionPercentage } from "../services/tourService";

export function TourProgressBar() {
  const { isActive, progress } = useTour();

  if (!isActive || !progress) return null;

  const allStepIds = getAllStepIds();
  const percentage = getCompletionPercentage(progress, allStepIds.length);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-background/50">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 shadow-lg"
      />
    </div>
  );
}
