import type { ActionResponse } from "@/types/common/action-response.type";
import type { ApiActionOptions } from "@/types/api-action/api-action-options.type";
import type { ApiActionWithFallbackOptions } from "@/types/api-action/api-action-with-fallback-options.type";
import type { ApiActionThrowOptions } from "@/types/api-action/api-action-throw-options.type";
import type { ErrorLogger } from "@/types/api-action/error-logger.type";
import { resolveLocaleMessages } from "@/i18n/resolve-locale-messages";
import { defaultErrorLogger } from "@/api-action/default-error-logger";
import { executeApiCall } from "@/api-action/execute-api-call";
import { unwrapActionResponse } from "@/api-action/unwrap-action-response";

export type { ActionResponse } from "@/types/common/action-response.type";
export type { MinimalResponse } from "@/types/api-action/minimal-response.type";
export type { ErrorLogger } from "@/types/api-action/error-logger.type";
export type { ApiCallResult } from "@/types/api-action/api-call-result.type";
export type { ApiActionBaseOptions } from "@/types/api-action/api-action-base-options.type";
export type { ApiActionOptions } from "@/types/api-action/api-action-options.type";
export type { ApiActionWithFallbackOptions } from "@/types/api-action/api-action-with-fallback-options.type";
export type { ApiActionThrowOptions } from "@/types/api-action/api-action-throw-options.type";

/**
 * Executes an API call and returns the unwrapped `data` or `fallback` on failure.
 */
export async function apiAction<T = unknown>(
  options: ApiActionWithFallbackOptions<T>,
): Promise<T>;
/**
 * Executes an API call and returns the unwrapped `data` or throws `Error` on failure.
 */
export async function apiAction<T = unknown>(
  options: ApiActionThrowOptions<T>,
): Promise<T>;
/**
 * Universal wrapper for API calls (Hono RPC, `fetch`, or Server Actions)
 * guaranteeing a standardized `ActionResponse<T>` without throwing uncaught errors.
 */
export async function apiAction<T = unknown>(
  options: ApiActionOptions<T>,
): Promise<ActionResponse<T>>;
export async function apiAction<T = unknown>(
  options:
    | ApiActionOptions<T>
    | ApiActionWithFallbackOptions<T>
    | ApiActionThrowOptions<T>,
): Promise<ActionResponse<T> | T> {
  const {
    apiCall,
    defaultErrorMessage,
    onError = defaultErrorLogger,
  } = options;
  const hasCustomOnError = options.onError !== undefined;
  const messages = resolveLocaleMessages();
  const resolvedDefaultError = defaultErrorMessage ?? messages.unexpectedError;

  let errorLogged = false;
  let createdError: Error | undefined;
  const trackedOnError: ErrorLogger = (message, details) => {
    errorLogged = true;
    const result = onError(message, details);
    if (result instanceof Error) {
      createdError = result;
    }
    return result;
  };

  const response = await executeApiCall<T>(
    apiCall,
    resolvedDefaultError,
    messages.serverRequestFailed,
    trackedOnError,
    hasCustomOnError,
  );

  if ("fallback" in options) {
    return unwrapActionResponse<T>(
      response,
      resolvedDefaultError,
      onError,
      errorLogged,
      createdError,
      { mode: "fallback", fallback: options.fallback as T },
    );
  }

  if ("throwOnError" in options && options.throwOnError === true) {
    return unwrapActionResponse<T>(
      response,
      resolvedDefaultError,
      onError,
      errorLogged,
      createdError,
      { mode: "throw" },
    );
  }

  return response;
}
