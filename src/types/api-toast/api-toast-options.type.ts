import type { ActionResponse } from "@/types/common/action-response.type";
import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";

/**
 * Options for `apiToast`.
 */
export interface ApiToastOptions<T = unknown> {
  /** Async action returning an `ActionResponse<T>`. */
  action: () => Promise<ActionResponse<T>>;
  /** Optional locale override (`"en" | "es" | "pt" | "it" | "fr"`). */
  locale?: GroovepackLocale;
  /** Message displayed while the action is pending. */
  loadingMessage?: string;
  /** Fallback message displayed when `action` succeeds without a `message` field. */
  successMessage?: string;
  /** Fallback message displayed when `action` fails without an `error`/`message` field. */
  errorMessage?: string;
  /** Callback invoked when the action resolves with `success: true`. */
  onSuccess?: (data: T | undefined, response: ActionResponse<T>) => void;
  /** Callback invoked when the action resolves with `success: false` or throws. */
  onError?: (error: string, response?: ActionResponse<T>) => void;
}
