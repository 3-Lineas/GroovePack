import { logger } from "@/logger/index";
import type { AppErrorParams } from "@/types/errors/app-error-params.type";

/**
 * Base domain exception carrying HTTP status code, semantic error code,
 * optional structured details, and automatic structured logging unless `silent`.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly silent: boolean;
  readonly details?: Record<string, unknown>;

  constructor(params: AppErrorParams) {
    super(
      params.message,
      params.cause !== undefined ? { cause: params.cause } : undefined,
    );
    this.name = params.name ?? new.target.name;
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.silent = params.silent ?? false;
    this.details = params.details;

    if (!this.silent) {
      logger.error(`[${this.code}] ${this.message}`, {
        statusCode: this.statusCode,
        ...(this.details !== undefined ? { details: this.details } : {}),
      });
    }
  }
}
