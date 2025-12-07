import { z } from "zod";

/**
 * Zod schema for validating demo flow JSON structure
 * Ensures type safety and data integrity for the interactive demo guide
 */

// Option schema for question slides
export const DemoOptionSchema = z.object({
  id: z.string().min(1, "Option ID is required"),
  text: z.string().min(1, "Option text is required"),
  emoji: z.string().optional(),
  nextSlide: z.string().min(1, "Next slide ID is required"),
});

// CTA schema for outro slides
export const DemoCTASchema = z.object({
  text: z.string().min(1, "CTA text is required"),
  action: z.string().optional(),
  href: z.string().optional(),
});

// Base slide schema
const BaseSlideSchema = z.object({
  id: z.string().min(1, "Slide ID is required"),
  type: z.enum(["intro", "content", "feature", "question", "outro"]),
  emoji: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  gradient: z.string().optional(),
  autoAdvance: z.boolean().optional().default(false),
  duration: z.number().positive().optional(),
  nextSlide: z.string().optional(),
});

// Intro slide schema
export const IntroSlideSchema = BaseSlideSchema.extend({
  type: z.literal("intro"),
  content: z.string().min(1, "Content is required for intro slides"),
  nextSlide: z.string().min(1, "Next slide ID is required"),
});

// Content slide schema
export const ContentSlideSchema = BaseSlideSchema.extend({
  type: z.literal("content"),
  content: z.string().min(1, "Content is required for content slides"),
  bullets: z.array(z.string()).optional(),
  nextSlide: z.string().optional(),
});

// Feature slide schema
export const FeatureSlideSchema = BaseSlideSchema.extend({
  type: z.literal("feature"),
  content: z.string().min(1, "Content is required for feature slides"),
  highlights: z.array(z.string()).optional(),
  nextSlide: z.string().optional(),
});

// Question slide schema
export const QuestionSlideSchema = BaseSlideSchema.extend({
  type: z.literal("question"),
  question: z.string().min(1, "Question text is required"),
  options: z
    .array(DemoOptionSchema)
    .min(2, "At least 2 options are required")
    .max(5, "Maximum 5 options allowed"),
  allowSkip: z.boolean().optional().default(false),
  skipTo: z.string().optional(),
  autoAdvance: z.literal(false).optional(),
});

// Outro slide schema
export const OutroSlideSchema = BaseSlideSchema.extend({
  type: z.literal("outro"),
  content: z.string().min(1, "Content is required for outro slides"),
  cta: z
    .object({
      primary: DemoCTASchema,
      secondary: DemoCTASchema.optional(),
    })
    .optional(),
  autoAdvance: z.literal(false).optional(),
});

// Union of all slide types
export const SlideSchema = z.discriminatedUnion("type", [
  IntroSlideSchema,
  ContentSlideSchema,
  FeatureSlideSchema,
  QuestionSlideSchema,
  OutroSlideSchema,
]);

// Metadata schema
export const DemoMetadataSchema = z.object({
  version: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  autoAdvance: z.boolean().optional().default(true),
  autoAdvanceDelay: z.number().positive().optional().default(5000),
  enableBranching: z.boolean().optional().default(true),
});

// Complete demo flow schema
export const DemoFlowSchema = z.object({
  metadata: DemoMetadataSchema,
  slides: z.array(SlideSchema).min(1, "At least one slide is required"),
});

// Type exports
export type DemoOption = z.infer<typeof DemoOptionSchema>;
export type DemoCTA = z.infer<typeof DemoCTASchema>;
export type DemoMetadata = z.infer<typeof DemoMetadataSchema>;
export type DemoSlide = z.infer<typeof SlideSchema>;
export type DemoFlow = z.infer<typeof DemoFlowSchema>;

// Helper function to validate demo flow
export function validateDemoFlow(data: unknown): DemoFlow {
  return DemoFlowSchema.parse(data);
}

// Helper function to safely parse demo flow
export function parseDemoFlow(data: unknown): { success: true; data: DemoFlow } | { success: false; error: string } {
  try {
    const validated = DemoFlowSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      };
    }
    return { success: false, error: "Unknown validation error" };
  }
}

