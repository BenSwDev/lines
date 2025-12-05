import { ZodError } from "zod";
import type { ZodIssue } from "zod";

/**
 * Translates Zod validation errors using a translation function
 * @param error - The Zod error to translate
 * @param t - Translation function from useTranslations hook
 * @returns New ZodError with translated error messages
 */
export function translateZodError(error: ZodError, t: (key: string) => string): ZodError {
  const translatedIssues: ZodIssue[] = error.errors.map((err) => {
    // If the error message looks like a translation key (contains dots), translate it
    if (err.message.includes(".")) {
      return {
        ...err,
        message: t(err.message)
      };
    }
    return err;
  });

  // Create a new ZodError with translated messages
  const translatedError = new ZodError(translatedIssues);
  return translatedError;
}

/**
 * Gets the first translated error message from a Zod error
 */
export function getFirstTranslatedError(error: ZodError, t: (key: string) => string): string {
  const firstError = error.errors[0];
  if (!firstError) {
    return t("errors.generic");
  }

  // If the error message looks like a translation key (contains dots), translate it
  if (firstError.message.includes(".")) {
    return t(firstError.message);
  }

  return firstError.message;
}
