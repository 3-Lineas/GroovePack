import type { ApiCallResult } from "@/types/api-action/api-call-result.type";
import type { ErrorLogger } from "@/types/api-action/error-logger.type";

/**
 * Shared options across all `apiAction` execution modes.
 */
export interface ApiActionBaseOptions<T = unknown> {
  /** Async call returning either a `Response`/`ClientResponse` or an `ActionResponse<T>`. */
  apiCall: () => Promise<ApiCallResult<T>>;
  /** Default fallback error message when the server does not provide one. */
  defaultErrorMessage?: string;
  /** Optional logger for unexpected exceptions or malformed payloads. */
  onError?: ErrorLogger;
}
