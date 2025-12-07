"use client";

import { motion } from "framer-motion";
import { questionCardVariants, questionCardTransition } from "../animations/slideTransitions";
import type { DemoOption } from "../utils/demoSchema";

interface QuestionCardProps {
  question: string;
  options: DemoOption[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
  allowSkip?: boolean;
  onSkip?: () => void;
}

/**
 * Interactive question card component for branching logic
 * Displays question with selectable options
 */
export function QuestionCard({
  question,
  options,
  selectedOptionId,
  onSelect,
  allowSkip = false,
  onSkip,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      <motion.h3
        className="text-2xl font-bold text-white md:text-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {question}
      </motion.h3>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <motion.button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                isSelected
                  ? "border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/30"
                  : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
              }`}
              variants={questionCardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ...questionCardTransition, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10 flex items-start gap-4">
                {option.emoji && (
                  <span className="text-3xl transition-transform group-hover:scale-110">{option.emoji}</span>
                )}
                <span className={`text-lg font-medium ${isSelected ? "text-white" : "text-white/90"}`}>
                  {option.text}
                </span>
              </div>
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {allowSkip && onSkip && (
        <motion.button
          onClick={onSkip}
          className="mx-auto block text-sm text-white/60 underline transition-colors hover:text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Skip this question
        </motion.button>
      )}
    </div>
  );
}

