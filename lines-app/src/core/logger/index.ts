/**
 * Structured logging utility
 * Replaces console.error/log with proper logging infrastructure
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, ...args: unknown[]) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString()
    };

    // Add additional context if provided
    if (args.length > 0) {
      entry.context = args.length === 1 ? args[0] : args;
    }

    if (process.env.NODE_ENV === "production") {
      // In production, use structured JSON logging
      // TODO: Integrate with logging service (Sentry, LogRocket, etc.)
      if (level === "error") {
        console.error(JSON.stringify(entry));
      } else {
        console.log(JSON.stringify(entry));
      }
    } else {
      // In development, use readable format
      const prefix = `[${level.toUpperCase()}]`;
      if (level === "error") {
        console.error(prefix, message, ...args);
      } else {
        console.log(prefix, message, ...args);
      }
    }
  }

  error(message: string, ...args: unknown[]) {
    this.log("error", message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log("warn", message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.log("info", message, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, ...args);
    }
  }
}

export const logger = new Logger();
