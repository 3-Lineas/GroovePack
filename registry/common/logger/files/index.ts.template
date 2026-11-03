/**
 * @fileoverview Universal Structured Logger for Groovepack.
 * Provides ANSI color formatting for development and structured JSON for production / Cloudflare Workers.
 *
 * @example
 * ```typescript
 * import { Logger } from "@/lib/logger";
 *
 * // 1. Create a logger instance for your service or domain
 * const logger = new Logger("AuthService");
 *
 * // 2. Log informational messages
 * logger.info("User registered successfully", { userId: "usr_123", email: "user@example.com" });
 *
 * // 3. Log errors with caught exceptions and context
 * try {
 *   await db.insert(user);
 * } catch (error) {
 *   logger.error("Failed to insert user into database", { file: "auth.service.ts", line: 45 }, error);
 * }
 * ```
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Context interface for logging metadata.
 * Allows tracking the origin of the log like file name, line number, or custom business properties.
 */
export interface LogContext {
  /** The filename where the log was triggered */
  file?: string;
  /** The line number in the source file */
  line?: number;
  /** Any other dynamic contextual properties */
  [key: string]: unknown;
}

/**
 * Standard structured logger designed to run across multiple environments:
 * - Local development (`NODE_ENV === "development"` or `"test"`): Prints readable, ANSI-colored formatted console logs.
 * - Production / Cloudflare Workers: Outputs structured JSON for automated log indexing and search.
 *
 * @example
 * ```typescript
 * import { Logger } from "@/lib/logger";
 *
 * const logger = new Logger("PaymentModule");
 *
 * logger.info("Processing checkout", { orderId: 456, amount: 2500 });
 * logger.warn("Low inventory detected", { productId: "prod_789", remaining: 2 });
 * logger.error("Payment gateway timeout", { gateway: "mercadopago" }, new Error("Timeout"));
 * ```
 */
export class Logger {
  private serviceName: string;

  /**
   * Initializes a new Logger instance.
   * @param serviceName - The name of the application service or module (e.g. "API:Auth", "Web:ServerAction").
   */
  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Evaluates if the current execution is running in development mode.
   * Safe across Node.js, Cloudflare Workers, Edge runtimes, and browsers
   * without requiring @types/node in the consumer project.
   * @returns true if running in development or testing, false otherwise.
   */
  private checkIsDev(): boolean {
    const globalEnv = (
      globalThis as unknown as {
        process?: {
          env?: Record<string, string | undefined>;
        };
      }
    ).process?.env;

    if (globalEnv?.NODE_ENV) {
      return (
        globalEnv.NODE_ENV === "development" ||
        globalEnv.NODE_ENV === "test"
      );
    }

    return true; // Fallback to dev if we can't determine
  }

  /**
   * Internal formatting and logging dispatcher.
   * Prints color logs to stdout in dev, and stringifies structured JSON in prod.
   * @param level - Severity level of the log.
   * @param message - Main descriptive message of the event.
   * @param context - Additional structured metadata.
   * @param args - Extra raw parameters or caught errors to include.
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    ...args: unknown[]
  ): void {
    const isDev = this.checkIsDev();
    const timestamp = new Date().toISOString();

    if (isDev) {
      // ANSI colors for readable terminal formatting in development
      const colors = {
        debug: "\x1b[36m", // Cyan
        info: "\x1b[32m", // Green
        warn: "\x1b[33m", // Yellow
        error: "\x1b[31m", // Red
      };
      const reset = "\x1b[0m";
      const color = colors[level] || reset;

      // Format contextual properties like [filename.ts:line] if provided
      const contextStr = context
        ? ` [${context.file || ""}${context.line ? `:${context.line}` : ""}]`
        : "";

      console.log(
        `${color}[${timestamp}] [${level.toUpperCase()}] [${this.serviceName}]${contextStr}:${reset} ${message}`,
        context ? { ...context } : "",
        ...args,
      );
      return;
    }

    // Structured JSON logging for production (Cloudflare Workers logs)
    const logData = {
      timestamp,
      level,
      serviceName: this.serviceName,
      message,
      context,
      details: args.length > 0 ? args : undefined,
    };

    if (level === "error") {
      console.error(JSON.stringify(logData));
      return;
    }

    if (level === "warn") {
      console.warn(JSON.stringify(logData));
      return;
    }

    console.log(JSON.stringify(logData));
  }

  /**
   * Logs events at the 'debug' level for local tracing.
   * @param message - Main event description.
   * @param context - Optional key-value metadata to append.
   * @param args - Additional parameters or error trace object.
   */
  debug(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log("debug", message, context, ...args);
  }

  /**
   * Logs events at the 'info' level.
   * @param message - Main event description.
   * @param context - Optional key-value metadata to append.
   * @param args - Additional parameters or error trace object.
   */
  info(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log("info", message, context, ...args);
  }

  /**
   * Logs warnings about unexpected business flow issues or schema validation errors.
   * @param message - Main event description.
   * @param context - Optional key-value metadata to append.
   * @param args - Additional parameters or error trace object.
   */
  warn(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log("warn", message, context, ...args);
  }

  /**
   * Logs critical errors, server crashes, or API connection issues.
   * @param message - Main event description.
   * @param context - Optional key-value metadata to append.
   * @param args - Additional parameters or error trace object.
   */
  error(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log("error", message, context, ...args);
  }
}
