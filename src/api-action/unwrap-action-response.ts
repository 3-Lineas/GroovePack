import { AppError } from "@/errors/app-error";
import type { ActionResponse } from "@/types/common/action-response.type";
import type { ErrorLogger } from "@/types/api-action/error-logger.type";
import type { UnwrapStrategy } from "@/types/api-action/unwrap-strategy.type";

/**
 * Unwraps an `ActionResponse<T>` for `fallback` or `throwOnError` modes,
 * guaranteeing `onError` is invoked at most once per failed call.
 */
export function unwrapActionResponse<T>(
  response: ActionResponse<T>,
  defaultErrorMessage: string,
  onError: ErrorLogger,
  errorLogged: boolean,
  createdError: Error | undefined,
  strategy: UnwrapStrategy<T>,
): T {
  if (response.success && response.data !== undefined) {
    return response.data;
  }

  const failureMessage = response.success
    ? (response.error ?? defaultErrorMessage)
    : (response.error ?? response.message ?? defaultErrorMessage);

  let resolvedError = createdError;

  if (!errorLogged) {
    const loggedResult = onError(failureMessage, {
      success: response.success,
      hasData: response.data !== undefined,
    });
    if (loggedResult instanceof Error) {
      resolvedError = loggedResult;
    }
  }

  if (strategy.mode === "throw") {
    throw resolvedError instanceof Error
      ? resolvedError
      : new AppError({
          name: "ApiActionError",
          message: failureMessage,
          statusCode: 500,
          code: "API_ACTION_FAILED",
          silent: true,
        });
  }

  return strategy.fallback;
}
