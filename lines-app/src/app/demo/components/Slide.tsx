"use client";

import { motion } from "framer-motion";
import { emojiVariants, emojiTransition, staggerContainer, staggerItem } from "../animations/slideTransitions";
import { QuestionCard } from "./QuestionCard";
import type { DemoSlide } from "../utils/demoSchema";

interface SlideProps {
  slide: DemoSlide;
  selectedBranch?: string;
  onSelectBranch?: (optionId: string) => void;
  onSkipQuestion?: () => void;
  direction?: number;
}

/**
 * Main slide component that renders different slide types
 * Handles intro, content, feature, question, and outro slides
 */
export function Slide({ slide, selectedBranch, onSelectBranch, onSkipQuestion }: SlideProps) {

  // Render question slide
  if (slide.type === "question") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-center">
        <motion.div
          className="mb-6 text-6xl md:text-8xl"
          variants={emojiVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={emojiTransition}
        >
          {slide.emoji}
        </motion.div>

        {slide.subtitle && (
          <motion.p
            className="mb-2 text-sm font-medium uppercase tracking-wider text-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {slide.subtitle}
          </motion.p>
        )}

        <QuestionCard
          question={slide.question}
          options={slide.options || []}
          selectedOptionId={selectedBranch}
          onSelect={onSelectBranch || (() => {})}
          allowSkip={slide.allowSkip}
          onSkip={onSkipQuestion}
        />
      </div>
    );
  }

  // Render outro slide
  if (slide.type === "outro") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-center">
        <motion.div
          className="mb-6 text-6xl md:text-8xl"
          variants={emojiVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={emojiTransition}
        >
          {slide.emoji}
        </motion.div>

        {slide.subtitle && (
          <motion.p
            className="mb-2 text-sm font-medium uppercase tracking-wider text-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {slide.subtitle}
          </motion.p>
        )}

        <motion.h2
          className="mb-4 text-4xl font-bold text-white md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {slide.title}
        </motion.h2>

        {slide.content && (
          <motion.p
            className="mx-auto max-w-2xl text-lg text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {slide.content}
          </motion.p>
        )}

        {slide.cta && (
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {slide.cta.primary && (
              <motion.a
                href={slide.cta.primary.href || "#"}
                className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {slide.cta.primary.text}
              </motion.a>
            )}
            {slide.cta.secondary && (
              <motion.a
                href={slide.cta.secondary.href || "#"}
                className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {slide.cta.secondary.text}
              </motion.a>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // Render intro, content, and feature slides
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-center">
      <motion.div
        className="mb-6 text-6xl md:text-8xl"
        variants={emojiVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={emojiTransition}
      >
        {slide.emoji}
      </motion.div>

      {slide.subtitle && (
        <motion.p
          className="mb-2 text-sm font-medium uppercase tracking-wider text-white/60"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {slide.subtitle}
        </motion.p>
      )}

      <motion.h2
        className="mb-4 text-4xl font-bold text-white md:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {slide.title}
      </motion.h2>

      {slide.content && (
        <motion.p
          className="mx-auto mb-8 max-w-2xl text-lg text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {slide.content}
        </motion.p>
      )}

      {((slide.type === "content" && slide.bullets) || (slide.type === "feature" && slide.highlights)) && (
        <motion.ul
          className="mx-auto max-w-2xl space-y-3 text-left"
          variants={staggerContainer}
          initial="enter"
          animate="center"
        >
          {((slide.type === "content" && slide.bullets) ||
            (slide.type === "feature" && slide.highlights) ||
            []).map((item: string, index: number) => (
            <motion.li
              key={index}
              className="flex items-start gap-3 text-white/90"
              variants={staggerItem}
            >
              <span className="mt-1 text-xl">•</span>
              <span>{item}</span>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

