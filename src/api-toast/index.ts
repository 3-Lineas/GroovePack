import { createApiToast } from "@/api-toast/create-api-toast";

export type { ActionResponse } from "@/types/common/action-response.type";
export type { ApiToastOptions } from "@/types/api-toast/api-toast-options.type";
export type {
  ApiToastDefaults,
  ToastedOptions,
} from "@/types/api-toast/api-toast-defaults.type";
export { createApiToast } from "@/api-toast/create-api-toast";

/**
 * Wraps an `ActionResponse<T>` promise with `sonner` loading, success, and error toasts.
 */
export const apiToast = createApiToast();
