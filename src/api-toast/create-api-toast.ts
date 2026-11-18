import type { ActionResponse } from "@/types/common/action-response.type";
import type { ApiToastDefaults } from "@/types/api-toast/api-toast-defaults.type";
import type { ApiToastOptions } from "@/types/api-toast/api-toast-options.type";
import { resolveToastManager } from "@/api-toast/resolve-toast-manager";
import { resolveLocaleMessages } from "@/i18n/resolve-locale-messages";

/**
 * Factory creating a pre-configured `apiToast` helper backed by Shadcn v4 (`@base-ui/react/toast`).
 */
export function createApiToast(defaults: ApiToastDefaults = {}) {
  return async function configuredApiToast<T = unknown>({
    action,
    toast = defaults.toast,
    locale = defaults.locale,
    loadingMessage,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  }: ApiToastOptions<T>): Promise<ActionResponse<T>> {
    const toastManager = await resolveToastManager(toast);
    const messages = resolveLocaleMessages(locale);
    const resolvedLoading =
      loadingMessage ?? defaults.defaultLoadingMessage ?? messages.loading;
    const resolvedSuccess =
      successMessage ?? defaults.defaultSuccessMessage ?? messages.success;
    const resolvedError =
      errorMessage ?? defaults.defaultErrorMessage ?? messages.operationFailed;

    const toastId = toastManager.add({
      title: resolvedLoading,
      type: "loading",
    });

    try {
      const actionResult = await action();

      if (actionResult.success) {
        const displayMessage = actionResult.message ?? resolvedSuccess;
        toastManager.update(toastId, {
          title: displayMessage,
          type: "success",
        });
        onSuccess?.(actionResult.data, actionResult);
        return actionResult;
      }

      const displayError =
        actionResult.error ?? actionResult.message ?? resolvedError;
      toastManager.update(toastId, {
        title: displayError,
        type: "error",
      });
      onError?.(displayError, actionResult);
      return actionResult;
    } catch (caughtError) {
      const fallbackError =
        caughtError instanceof Error ? caughtError.message : resolvedError;
      toastManager.update(toastId, {
        title: fallbackError,
        type: "error",
      });
      onError?.(fallbackError);

      return {
        success: false,
        error: fallbackError,
      };
    }
  };
}
