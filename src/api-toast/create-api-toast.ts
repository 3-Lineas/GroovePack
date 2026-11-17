import { toast } from "sonner";
import type { ActionResponse } from "@/types/common/action-response.type";
import type { ApiToastDefaults } from "@/types/api-toast/api-toast-defaults.type";
import type { ApiToastOptions } from "@/types/api-toast/api-toast-options.type";
import { resolveLocaleMessages } from "@/i18n/resolve-locale-messages";

/**
 * Factory creating a pre-configured `apiToast` helper with custom default
 * messages and/or locale.
 */
export function createApiToast(defaults: ApiToastDefaults = {}) {
  return async function configuredApiToast<T = unknown>({
    action,
    locale = defaults.locale,
    loadingMessage,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  }: ApiToastOptions<T>): Promise<ActionResponse<T>> {
    const messages = resolveLocaleMessages(locale);
    const resolvedLoading =
      loadingMessage ?? defaults.defaultLoadingMessage ?? messages.loading;
    const resolvedSuccess =
      successMessage ?? defaults.defaultSuccessMessage ?? messages.success;
    const resolvedError =
      errorMessage ?? defaults.defaultErrorMessage ?? messages.operationFailed;

    const toastId = toast.loading(resolvedLoading);

    try {
      const actionResult = await action();

      if (actionResult.success) {
        const displayMessage = actionResult.message ?? resolvedSuccess;
        toast.success(displayMessage, { id: toastId });
        onSuccess?.(actionResult.data, actionResult);
        return actionResult;
      }

      const displayError =
        actionResult.error ?? actionResult.message ?? resolvedError;
      toast.error(displayError, { id: toastId });
      onError?.(displayError, actionResult);
      return actionResult;
    } catch (caughtError) {
      const fallbackError =
        caughtError instanceof Error ? caughtError.message : resolvedError;
      toast.error(fallbackError, { id: toastId });
      onError?.(fallbackError);

      return {
        success: false,
        error: fallbackError,
      };
    }
  };
}
