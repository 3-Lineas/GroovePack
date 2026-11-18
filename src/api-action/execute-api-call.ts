import type { ActionResponse } from "@/types/common/action-response.type";
import type { ApiCallResult } from "@/types/api-action/api-call-result.type";
import type { ErrorLogger } from "@/types/api-action/error-logger.type";
import { isMinimalResponse } from "@/api-action/is-minimal-response";
import { isActionResponse } from "@/api-action/is-action-response";
import { handleHttpResponse } from "@/api-action/handle-http-response";

/**
 * Executes `apiCall` and normalizes any `MinimalResponse`, `ActionResponse`,
 * raw value, or thrown exception into a standardized `ActionResponse<T>`.
 */
export async function executeApiCall<T>(
  apiCall: () => Promise<ApiCallResult<T>>,
  resolvedDefaultError: string,
  serverRequestFailedMessage: string,
  onError: ErrorLogger,
): Promise<ActionResponse<T>> {
  try {
    const actionResult = await apiCall();

    if (isMinimalResponse(actionResult)) {
      return await handleHttpResponse<T>(
        actionResult,
        resolvedDefaultError,
        serverRequestFailedMessage,
        onError,
      );
    }

    if (isActionResponse<T>(actionResult)) {
      return actionResult;
    }

    return {
      success: true,
      data: actionResult as T,
    };
  } catch (caughtError) {
    onError("Unexpected error in apiAction", {
      error:
        caughtError instanceof Error ? caughtError.message : String(caughtError),
    });

    return {
      success: false,
      error: resolvedDefaultError,
    };
  }
}
