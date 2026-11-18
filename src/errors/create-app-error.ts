import { AppError } from "@/errors/app-error";
import type { AppErrorFactory } from "@/types/errors/app-error-factory.type";
import type { CreateAppErrorOptions } from "@/types/errors/create-app-error-options.type";

/**
 * Creates a reusable callable `AppErrorFactory` for a specific domain error.
 *
 * Compatible with both `throw myError(message?, details?)` and `apiAction({ onError: myError })`.
 */
export function createAppError(options: CreateAppErrorOptions): AppErrorFactory {
  const factory = (
    message?: string,
    details?: Record<string, unknown>,
  ): AppError => {
    const resolvedMessage =
      message !== undefined && message.trim().length > 0
        ? message
        : options.defaultMessage;

    const appError = new AppError({
      name: options.name ?? options.code,
      message: resolvedMessage,
      statusCode: options.statusCode,
      code: options.code,
      silent: options.silent,
      details,
    });

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(appError, factory);
    }

    return appError;
  };

  Object.defineProperties(factory, {
    code: {
      value: options.code,
      writable: false,
      enumerable: true,
      configurable: false,
    },
    statusCode: {
      value: options.statusCode,
      writable: false,
      enumerable: true,
      configurable: false,
    },
    is: {
      value: (caughtError: unknown): caughtError is AppError =>
        caughtError instanceof AppError && caughtError.code === options.code,
      writable: false,
      enumerable: true,
      configurable: false,
    },
  });

  return factory as AppErrorFactory;
}
