"use client";

import { motion } from "framer-motion";
import { emojiVariants, emojiTransition, staggerContainer, staggerItem } from "../animations/slideTransitions";
import { QuestionCard } from "./QuestionCard";
import { useTranslations } from "@/core/i18n/provider";
import type { DemoSlide } from "../utils/demoSchema";

interface SlideProps {
  slide: DemoSlide;
  selectedBranch?: string;
  onSelectBranch?: (optionId: string) => void;
  onSkipQuestion?: () => void;
  direction?: number;
}

/**
 * Helper to get localized text
 */
function getLocalizedText(slide: DemoSlide, field: "title" | "subtitle" | "content" | "question", t: (key: string) => string, locale: string): string {
  // Check for translation key first
  const keyField = `${field}Key` as keyof DemoSlide;
  if (keyField in slide && slide[keyField]) {
    const key = slide[keyField] as string;
    if (key.startsWith("demo.")) {
      const translated = t(key);
      if (translated !== key) return translated;
    }
  }

  // Check for language-specific field (e.g., titleHe)
  const langField = locale === "he" ? `${field}He` as keyof DemoSlide : field;
  if (langField in slide && slide[langField]) {
    return String(slide[langField]);
  }

  // Fallback to default field
  if (field in slide && slide[field]) {
    return String(slide[field]);
  }

  return "";
}

/**
 * Helper to get localized array
 */
function getLocalizedArray(slide: DemoSlide, field: "bullets" | "highlights", locale: string): string[] {
  const langField = locale === "he" ? `${field}He` as keyof DemoSlide : field;
  if (langField in slide && Array.isArray(slide[langField])) {
    return slide[langField] as string[];
  }
  if (field in slide && Array.isArray(slide[field])) {
    return slide[field] as string[];
  }
  return [];
}

/**
 * Main slide component that renders different slide types
 * Handles intro, content, feature, question, and outro slides
 */
export function Slide({ slide, selectedBranch, onSelectBranch, onSkipQuestion }: SlideProps) {
  const { t, locale } = useTranslations();

  // Render question slide
  if (slide.type === "question") {
    const question = getLocalizedText(slide, "question", t, locale);
    const subtitle = getLocalizedText(slide, "subtitle", t, locale);
    const title = getLocalizedText(slide, "title", t, locale);

    // Localize options
    const localizedOptions = (slide.options || []).map((option: { id: string; text: string; textHe?: string; emoji?: string; nextSlide: string }) => ({
      ...option,
      text: locale === "he" && option.textHe ? option.textHe : option.text,
    }));

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

        {subtitle && (
          <motion.p
            className="mb-2 text-sm font-medium uppercase tracking-wider text-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}

        {title && (
          <motion.h2
            className="mb-4 text-3xl font-bold text-white md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {title}
          </motion.h2>
        )}

        <div className="w-full">
          <QuestionCard
            question={question}
            options={localizedOptions}
            selectedOptionId={selectedBranch}
            onSelect={onSelectBranch || (() => {})}
            allowSkip={slide.allowSkip}
            onSkip={onSkipQuestion}
          />
          {slide.allowSkip && onSkipQuestion && (
            <motion.button
              onClick={onSkipQuestion}
              className="mx-auto mt-4 block text-sm text-white/60 underline transition-colors hover:text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {t("demo.navigation.skip")}
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  // Render outro slide
  if (slide.type === "outro") {
    const title = getLocalizedText(slide, "title", t, locale);
    const subtitle = getLocalizedText(slide, "subtitle", t, locale);
    const content = getLocalizedText(slide, "content", t, locale);

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

        {subtitle && (
          <motion.p
            className="mb-2 text-sm font-medium uppercase tracking-wider text-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.h2
          className="mb-4 text-4xl font-bold text-white md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {title}
        </motion.h2>

        {content && (
          <motion.p
            className="mx-auto mb-8 max-w-2xl text-lg text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {content}
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
                {locale === "he" && slide.cta.primary.textHe ? slide.cta.primary.textHe : slide.cta.primary.text}
              </motion.a>
            )}
            {slide.cta.secondary && (
              <motion.a
                href={slide.cta.secondary.href || "#"}
                className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {locale === "he" && slide.cta.secondary.textHe ? slide.cta.secondary.textHe : slide.cta.secondary.text}
              </motion.a>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // Render intro, content, and feature slides
  const title = getLocalizedText(slide, "title", t, locale);
  const subtitle = getLocalizedText(slide, "subtitle", t, locale);
  const content = getLocalizedText(slide, "content", t, locale);
  const bullets = getLocalizedArray(slide, "bullets", locale);
  const highlights = getLocalizedArray(slide, "highlights", locale);
  const items = bullets.length > 0 ? bullets : highlights;

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

      {subtitle && (
        <motion.p
          className="mb-2 text-sm font-medium uppercase tracking-wider text-white/60"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}

      <motion.h2
        className="mb-4 text-4xl font-bold text-white md:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h2>

      {content && (
        <motion.p
          className="mx-auto mb-8 max-w-2xl text-lg text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {content}
        </motion.p>
      )}

      {items.length > 0 && (
        <motion.ul
          className="mx-auto max-w-2xl space-y-3 text-left"
          variants={staggerContainer}
          initial="enter"
          animate="center"
        >
          {items.map((item: string, index: number) => (
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
