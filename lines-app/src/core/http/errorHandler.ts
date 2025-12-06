/**
 * Shared error handling utility
 * Reduces code duplication across server actions
 */

import { logger } from "@/core/logger";

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Wraps an async operation with consistent error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<ActionResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    logger.error(errorMessage, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage
    };
  }
}

/**
 * Wraps an async operation that may return null
 */
export async function withErrorHandlingNullable<T>(
  operation: () => Promise<T | null>,
  errorMessage: string
): Promise<ActionResult<T | null>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    logger.error(errorMessage, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage
    };
  }
}

