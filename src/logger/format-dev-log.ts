import type { LogContext } from "@/types/logger/log-context.type";
import type { LogLevel } from "@/types/logger/log-level.type";

const LEVEL_COLORS: Record<LogLevel, string> = {
  INFO: "\x1b[32m",
  WARN: "\x1b[33m",
  ERROR: "\x1b[31m",
  DEBUG: "\x1b[36m",
};

const RESET_COLOR = "\x1b[0m";
const DIM_COLOR = "\x1b[2m";

/**
 * Formats a log entry with ANSI colors for human-readable development output.
 */
export function formatDevLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  timestamp?: string,
): string {
  const color = LEVEL_COLORS[level];
  const resolvedTimestamp = timestamp ?? new Date().toISOString();
  const baseLine = `${DIM_COLOR}${resolvedTimestamp}${RESET_COLOR} ${color}[${level}]${RESET_COLOR} ${message}`;

  if (!context || Object.keys(context).length === 0) {
    return baseLine;
  }

  return `${baseLine} ${DIM_COLOR}${JSON.stringify(context)}${RESET_COLOR}`;
}
