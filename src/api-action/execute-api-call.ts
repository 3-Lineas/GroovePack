import type { ActionResponse } from "@/types/common/action-response.type";
import type { ApiCallInput } from "@/types/api-action/api-call-input.type";
import type { ErrorLogger } from "@/types/api-action/error-logger.type";
import { isMinimalResponse } from "@/api-action/is-minimal-response";
import { isActionResponse } from "@/api-action/is-action-response";
import { handleHttpResponse } from "@/api-action/handle-http-response";

/**
 * Executes `apiCall` (factory or direct Promise) and normalizes any `MinimalResponse`,
 * `ActionResponse`, raw value, or thrown exception into a standardized `ActionResponse<T>`.
 */
export async function executeApiCall<T>(
  apiCall: ApiCallInput<T>,
  resolvedDefaultError: string,
  serverRequestFailedMessage: string,
  onError: ErrorLogger,
  hasCustomOnError: boolean,
): Promise<ActionResponse<T>> {
  try {
    const actionResult =
      typeof apiCall === "function" ? await apiCall() : await apiCall;

    if (isMinimalResponse(actionResult)) {
      return await handleHttpResponse<T>(
        actionResult,
        resolvedDefaultError,
        serverRequestFailedMessage,
        onError,
        hasCustomOnError,
      );
    }

    if (isActionResponse<T>(actionResult)) {
      if (!actionResult.success && hasCustomOnError) {
        onError(
          actionResult.error ?? actionResult.message ?? resolvedDefaultError,
          { success: false },
        );
      }
      return actionResult;
    }

    return {
      success: true,
      data: actionResult as T,
    };
  } catch (caughtError) {
    onError(resolvedDefaultError, {
      error:
        caughtError instanceof Error ? caughtError.message : String(caughtError),
    });

    return {
      success: false,
      error: resolvedDefaultError,
    };
  }
}
