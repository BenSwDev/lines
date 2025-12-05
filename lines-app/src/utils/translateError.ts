/**
 * Utility to translate error messages from server actions
 * If the error is a translation key (contains dots), it will be translated
 * Otherwise, it returns the error as-is
 */
export function translateError(
  error: string | null | undefined,
  t: (key: string) => string
): string {
  if (!error) {
    return "";
  }

  // If error looks like a translation key (contains dots), translate it
  if (error.includes(".")) {
    return t(error);
  }

  // Otherwise, return as-is (for backward compatibility with plain error messages)
  return error;
}
