/**
 * Design Tokens
 *
 * Centralized design system tokens for consistent styling across the application.
 * Based on 8px base unit spacing system and modern design principles.
 */

export const designTokens = {
  colors: {
    brand: {
      primary: "hsl(221.2 83.2% 53.3%)",
      secondary: "hsl(262.1 83.3% 57.8%)",
      accent: "hsl(280 100% 70%)"
    },
    semantic: {
      success: "hsl(142.1 76.2% 36.3%)",
      warning: "hsl(38 92% 50%)",
      error: "hsl(0 84.2% 60.2%)",
      info: "hsl(221.2 83.2% 53.3%)"
    }
  },
  spacing: {
    base: 8, // 8px base unit
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]
  },
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"]
    },
    scale: {
      "display-2xl": { size: "4.5rem", lineHeight: 1, letterSpacing: "-0.02em" },
      "display-xl": { size: "3.75rem", lineHeight: 1, letterSpacing: "-0.02em" },
      "heading-1": { size: "3rem", lineHeight: 1.2, letterSpacing: "-0.01em" },
      "heading-2": { size: "2.25rem", lineHeight: 1.3, letterSpacing: "-0.01em" },
      "heading-3": { size: "1.875rem", lineHeight: 1.4 },
      "heading-4": { size: "1.5rem", lineHeight: 1.5 },
      "body-lg": { size: "1.125rem", lineHeight: 1.75 },
      body: { size: "1rem", lineHeight: 1.75 },
      "body-sm": { size: "0.875rem", lineHeight: 1.5 },
      caption: { size: "0.75rem", lineHeight: 1.5 }
    }
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
  },
  animations: {
    duration: {
      fast: "150ms",
      base: "200ms",
      slow: "300ms"
    },
    easing: {
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  },
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px"
  }
} as const;
