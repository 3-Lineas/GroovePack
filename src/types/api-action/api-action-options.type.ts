import type { ApiCallResult } from "@/types/api-action/api-call-result.type";
import type { ErrorLogger } from "@/types/api-action/error-logger.type";
import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";

/**
 * Options for `apiAction`.
 */
export interface ApiActionOptions<T = unknown> {
  /** Async call returning either a `Response`/`ClientResponse` or an `ActionResponse<T>`. */
  apiCall: () => Promise<ApiCallResult<T>>;
  /** Optional locale override (`"en" | "es" | "pt" | "it" | "fr"`). */
  locale?: GroovepackLocale;
  /** Default fallback error message when the server does not provide one. */
  defaultErrorMessage?: string;
  /** Optional logger for unexpected exceptions or malformed payloads. */
  onError?: ErrorLogger;
}
