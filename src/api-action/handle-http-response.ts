import type { ActionResponse } from "@/types/common/action-response.type";
import type { ErrorLogger } from "@/types/api-action/error-logger.type";
import type { MinimalResponse } from "@/types/api-action/minimal-response.type";
import { isActionResponse } from "@/api-action/is-action-response";
import { tryParseJson } from "@/api-action/try-parse-json";

/**
 * Normalizes a `MinimalResponse` (Fetch / Hono RPC) into an `ActionResponse<T>`.
 */
export async function handleHttpResponse<T>(
  response: MinimalResponse,
  fallbackErrorMessage: string,
  serverRequestFailedMessage: string,
  logError: ErrorLogger,
): Promise<ActionResponse<T>> {
  const payload = await tryParseJson(response);

  if (!response.ok) {
    const serverError =
      payload && typeof payload["error"] === "string"
        ? payload["error"]
        : undefined;
    const serverMessage =
      payload && typeof payload["message"] === "string"
        ? payload["message"]
        : undefined;

    return {
      success: false,
      error: serverError ?? serverMessage ?? fallbackErrorMessage,
    };
  }

  if (isActionResponse<T>(payload)) {
    return payload;
  }

  if (payload !== null) {
    return {
      success: true,
      data: payload as T,
    };
  }

  logError("Received non-JSON 2xx response from server", {
    status: response.status,
  });

  return {
    success: false,
    error: serverRequestFailedMessage,
  };
}
