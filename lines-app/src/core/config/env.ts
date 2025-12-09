import { z } from "zod";
import { logger } from "@/core/logger";

/**
 * Environment variables schema with validation
 */
const envSchema = z
  .object({
    POSTGRES_PRISMA_URL: z.string().url("POSTGRES_PRISMA_URL must be a valid URL"),
    DATABASE_URL: z.string().url().optional(), // Fallback for backward compatibility
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(32).optional()
  })
  .refine(
    (data) => {
      // Require at least one database URL
      return !!(data.POSTGRES_PRISMA_URL || data.DATABASE_URL);
    },
    {
      message: "Either POSTGRES_PRISMA_URL or DATABASE_URL must be provided"
    }
  )
  .refine(
    (data) => {
      // Require auth secrets in production
      if (data.NODE_ENV === "production") {
        return !!data.NEXTAUTH_URL && !!data.NEXTAUTH_SECRET;
      }
      return true;
    },
    {
      message: "NEXTAUTH_URL and NEXTAUTH_SECRET are required in production"
    }
  );

/**
 * Validated environment variables
 * Throws at runtime if environment is invalid
 */
function getEnv() {
  const parsed = envSchema.safeParse({
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  });

  if (!parsed.success) {
    logger.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = getEnv();

// Type export for use in other modules
export type Env = z.infer<typeof envSchema>;
