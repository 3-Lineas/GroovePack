import type { LogContext } from "@/types/logger/log-context.type";
import type { LogLevel } from "@/types/logger/log-level.type";
import { checkIsDevelopment } from "@/logger/check-is-development";
import { formatDevLog } from "@/logger/format-dev-log";

export type { LogLevel } from "@/types/logger/log-level.type";
export type { LogContext } from "@/types/logger/log-context.type";

/**
 * Universal structured logger.
 * Outputs ANSI-colored lines in development/test and structured JSON in production.
 */
class Logger {
  private write(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const isDev = checkIsDevelopment();

    if (isDev) {
      const formatted = formatDevLog(level, message, context, timestamp);
      this.emitToConsole(level, formatted);
      return;
    }

    const payload = JSON.stringify({
      timestamp,
      level,
      message,
      ...(context ? { context } : {}),
    });
    this.emitToConsole(level, payload);
  }

  private emitToConsole(level: LogLevel, line: string): void {
    if (level === "ERROR") {
      console.error(line);
      return;
    }
    if (level === "WARN") {
      console.warn(line);
      return;
    }
    console.log(line);
  }

  public info(message: string, context?: LogContext): void {
    this.write("INFO", message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.write("WARN", message, context);
  }

  public error(message: string, context?: LogContext): void {
    this.write("ERROR", message, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.write("DEBUG", message, context);
  }
}

export const logger = new Logger();
