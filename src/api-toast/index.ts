import { createApiToast } from "@/api-toast/create-api-toast";

export type { ActionResponse } from "@/types/common/action-response.type";
export type { ApiToastOptions } from "@/types/api-toast/api-toast-options.type";
export type {
  ApiToastDefaults,
  ToastedOptions,
} from "@/types/api-toast/api-toast-defaults.type";
export type { BaseUiToastManager } from "@/types/api-toast/base-ui-toast-manager.type";
export type { BaseUiToastPayload } from "@/types/api-toast/base-ui-toast-payload.type";
export { createApiToast } from "@/api-toast/create-api-toast";

/**
 * Wraps an `ActionResponse<T>` promise with Shadcn v4 (`@base-ui/react/toast`) loading, success, and error states.
 */
export const apiToast = createApiToast();
