/**
 * Input sanitization utilities
 * Protects against XSS attacks and malicious input
 */

/**
 * Sanitize HTML content by escaping special characters
 * Prevents XSS attacks in user-generated content
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;"
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize text input by removing potentially dangerous characters
 * Keeps only alphanumeric, spaces, and common punctuation
 */
export function sanitizeText(input: string): string {
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Remove script tags and event handlers
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  // Escape special characters
  sanitized = sanitizeHtml(sanitized);

  return sanitized.trim();
}

/**
 * Sanitize URL input
 * Validates and sanitizes URLs to prevent XSS and malicious redirects
 */
export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid URL protocol");
    }

    return url.toString();
  } catch {
    // If URL parsing fails, return empty string
    return "";
  }
}

/**
 * Sanitize email input
 * Removes potentially dangerous characters while preserving email format
 */
export function sanitizeEmail(input: string): string {
  // Remove HTML tags and scripts
  let sanitized = input.replace(/<[^>]*>/g, "");
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove whitespace
  sanitized = sanitized.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return "";
  }

  return sanitized;
}

/**
 * Sanitize phone number input
 * Removes non-numeric characters except + and - for international formats
 */
export function sanitizePhone(input: string): string {
  // Remove all characters except digits, +, -, spaces, and parentheses
  let sanitized = input.replace(/[^\d+\-()\s]/g, "");

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  return sanitized.trim();
}

/**
 * Sanitize file name
 * Removes path traversal attempts and dangerous characters
 */
export function sanitizeFileName(input: string): string {
  // Remove path traversal attempts
  let sanitized = input.replace(/\.\./g, "");
  sanitized = sanitized.replace(/\//g, "");
  sanitized = sanitized.replace(/\\/g, "");

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Remove script tags
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Keep only safe characters: alphanumeric, spaces, dots, hyphens, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9.\s\-_]/g, "");

  return sanitized.trim();
}

/**
 * Sanitize SQL input (basic protection)
 * Note: Always use parameterized queries with Prisma/ORM
 * This is an additional layer of protection
 */
export function sanitizeSql(input: string): string {
  // Remove SQL injection patterns
  const dangerous = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(;|\||&|`)/g
  ];

  let sanitized = input;
  dangerous.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });

  return sanitized.trim();
}

/**
 * Sanitize JSON input
 * Validates and sanitizes JSON strings
 */
export function sanitizeJson(input: string): string {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return "";
  }
}

/**
 * Sanitize object recursively
 * Sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    sanitizeText?: boolean;
    sanitizeHtml?: boolean;
    allowedKeys?: string[];
  } = {}
): T {
  const {
    sanitizeText: sanitizeTextFields = true,
    sanitizeHtml: sanitizeHtmlFields = false,
    allowedKeys
  } = options;

  const sanitized = { ...obj };

  for (const key in sanitized) {
    // Skip if key is not in allowed list (if provided)
    if (allowedKeys && !allowedKeys.includes(key)) {
      continue;
    }

    const value = sanitized[key];

    if (typeof value === "string") {
      if (sanitizeHtmlFields) {
        sanitized[key] = sanitizeHtml(value) as T[Extract<keyof T, string>];
      } else if (sanitizeTextFields) {
        sanitized[key] = sanitizeText(value) as T[Extract<keyof T, string>];
      }
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options) as T[Extract<
        keyof T,
        string
      >];
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === "string") {
          return sanitizeTextFields ? sanitizeText(item) : item;
        }
        if (item && typeof item === "object") {
          return sanitizeObject(item as Record<string, unknown>, options);
        }
        return item;
      }) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

/**
 * Remove null bytes and control characters
 */
export function removeControlCharacters(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]/g, "");
}

/**
 * Sanitize search query
 * Sanitizes user search input to prevent injection attacks
 */
export function sanitizeSearchQuery(input: string): string {
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Remove script tags
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  // Remove control characters
  sanitized = removeControlCharacters(sanitized);

  // Limit length
  sanitized = sanitized.substring(0, 500);

  return sanitized.trim();
}
