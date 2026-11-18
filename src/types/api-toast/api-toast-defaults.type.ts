import type { ActionResponse } from "@/types/common/action-response.type";

/**
 * Default configuration for `createApiToast`.
 */
export interface ApiToastDefaults {
  /** Default loading message when not specified per call. */
  defaultLoadingMessage?: string;
  /** Default success message when not specified per call. */
  defaultSuccessMessage?: string;
  /** Default error message when not specified per call. */
  defaultErrorMessage?: string;
}

export type ToastedOptions<T = unknown> = {
  action: () => Promise<ActionResponse<T>>;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: T | undefined, response: ActionResponse<T>) => void;
  onError?: (error: string, response?: ActionResponse<T>) => void;
};
