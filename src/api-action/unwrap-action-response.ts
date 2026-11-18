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
  strategy: UnwrapStrategy<T>,
): T {
  if (response.success && response.data !== undefined) {
    return response.data;
  }

  const failureMessage = response.success
    ? (response.error ?? defaultErrorMessage)
    : (response.error ?? response.message ?? defaultErrorMessage);

  if (!errorLogged) {
    onError(failureMessage, {
      success: response.success,
      hasData: response.data !== undefined,
    });
  }

  if (strategy.mode === "throw") {
    throw new Error(failureMessage);
  }

  return strategy.fallback;
}
