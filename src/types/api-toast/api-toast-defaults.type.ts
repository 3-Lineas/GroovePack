import type { ActionResponse } from "@/types/common/action-response.type";
import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";

/**
 * Default configuration for `createApiToast`.
 */
export interface ApiToastDefaults {
  /** Optional locale override (`"en" | "es" | "pt" | "it" | "fr"`). */
  locale?: GroovepackLocale;
  /** Default loading message when not specified per call. */
  defaultLoadingMessage?: string;
  /** Default success message when not specified per call. */
  defaultSuccessMessage?: string;
  /** Default error message when not specified per call. */
  defaultErrorMessage?: string;
}

export type ToastedOptions<T = unknown> = {
  action: () => Promise<ActionResponse<T>>;
  locale?: GroovepackLocale;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: T | undefined, response: ActionResponse<T>) => void;
  onError?: (error: string, response?: ActionResponse<T>) => void;
};
