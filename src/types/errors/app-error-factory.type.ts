import type { AppError } from "@/errors/app-error";

/**
 * Callable custom exception factory compatible with `apiAction` `onError` and `throw`.
 */
export interface AppErrorFactory {
  (message?: string, details?: Record<string, unknown>): AppError;
  readonly code: string;
  readonly statusCode: number;
  is(caughtError: unknown): caughtError is AppError;
}
