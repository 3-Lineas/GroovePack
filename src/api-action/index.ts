import type { ActionResponse } from "@/types/common/action-response.type";
import type { ApiActionOptions } from "@/types/api-action/api-action-options.type";
import { resolveLocaleMessages } from "@/i18n/resolve-locale-messages";
import { defaultErrorLogger } from "@/api-action/default-error-logger";
import { isMinimalResponse } from "@/api-action/is-minimal-response";
import { isActionResponse } from "@/api-action/is-action-response";
import { handleHttpResponse } from "@/api-action/handle-http-response";

export type { ActionResponse } from "@/types/common/action-response.type";
export type { MinimalResponse } from "@/types/api-action/minimal-response.type";
export type { ErrorLogger } from "@/types/api-action/error-logger.type";
export type { ApiCallResult } from "@/types/api-action/api-call-result.type";
export type { ApiActionOptions } from "@/types/api-action/api-action-options.type";

/**
 * Universal wrapper for API calls (Hono RPC, `fetch`, or Server Actions)
 * guaranteeing a standardized `ActionResponse<T>` without throwing uncaught errors.
 */
export async function apiAction<T = unknown>({
  apiCall,
  locale,
  defaultErrorMessage,
  onError = defaultErrorLogger,
}: ApiActionOptions<T>): Promise<ActionResponse<T>> {
  const messages = resolveLocaleMessages(locale);
  const resolvedDefaultError = defaultErrorMessage ?? messages.unexpectedError;

  try {
    const actionResult = await apiCall();

    if (isMinimalResponse(actionResult)) {
      return await handleHttpResponse<T>(
        actionResult,
        resolvedDefaultError,
        messages.serverRequestFailed,
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
