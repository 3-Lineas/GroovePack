/**
 * @fileoverview User Feedback Toast Helper based on Sonner.
 * Orquestates async actions and Server Actions providing automated loading,
 * success, and error feedback toasts, returning the typed ActionResponse.
 *
 * @example
 * ```typescript
 * import { apiToast, toasted } from "@/lib/api-toast";
 * import { loginAction } from "@/actions/auth";
 *
 * // Example in a React Form handler
 * const handleSubmit = async (values: LoginFormValues) => {
 *   const res = await apiToast({
 *     action: () => loginAction(values),
 *     loadingMessage: "Verificando credenciales...",
 *     successMessage: (res) => `¡Bienvenido de nuevo, ${res.data?.name}!`,
 *     onSuccess: () => router.push("/dashboard"),
 *   });
 *
 *   if (res.success) {
 *     // Action completed successfully
 *   }
 * };
 * ```
 */

import { toast } from "sonner";

/**
 * Standard response interface for Server Actions, API calls, and local procedures.
 *
 * @template T - Type of the success response data.
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string | unknown;
  error?: string;
  data?: T;
}

/**
 * Options for configuring apiToast / toasted.
 *
 * @template T - Type of the data payload.
 */
export interface ApiToastOptions<T> {
  /** The async function returning an ActionResponse to execute */
  action: () => Promise<ActionResponse<T>>;
  /** Message displayed while the action is in progress (default: "Procesando...") */
  loadingMessage?: string;
  /** Message shown on success. Can be a string or a callback taking the response */
  successMessage?: string | ((res: ActionResponse<T>) => string);
  /** Message shown on error. Can be a string or a callback taking the error object */
  errorMessage?: string | ((error: Error) => string);
  /** Callback triggered when the action succeeds */
  onSuccess?: (res: ActionResponse<T>) => void | Promise<void>;
  /** Callback triggered when the action fails */
  onError?: (error: Error) => void | Promise<void>;
}

export type ToastedOptions<T> = ApiToastOptions<T>;

/**
 * Executes an async action with Sonner toast feedback for loading, success, and error states.
 * Returns the final ActionResponse<T> directly to the caller.
 *
 * @example
 * ```typescript
 * const res = await apiToast({
 *   action: () => updateUserProfile(data),
 *   loadingMessage: "Actualizando datos...",
 *   successMessage: "Perfil guardado con éxito",
 *   onSuccess: (res) => console.log("Updated:", res.data),
 * });
 * ```
 *
 * @template T - Type of the payload returned on success.
 * @param options - Configuration options for feedback messages and callbacks.
 * @returns The resolved ActionResponse<T>.
 */
export async function apiToast<T>(options: ApiToastOptions<T>): Promise<ActionResponse<T>> {
  const {
    action,
    loadingMessage = "Procesando...",
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  } = options;

  let capturedResponse: ActionResponse<T> | null = null;

  const promise = (async (): Promise<ActionResponse<T>> => {
    const res = await action();
    capturedResponse = res;

    if (!res.success) {
      const errorMsg =
        typeof res.message === "string"
          ? res.message
          : res.error || "Ocurrió un error inesperado al procesar la solicitud.";
      throw new Error(errorMsg);
    }

    if (onSuccess) {
      await onSuccess(res);
    }

    return res;
  })();

  toast.promise(promise, {
    loading: loadingMessage,
    success: (res) => {
      if (typeof successMessage === "function") {
        return successMessage(res);
      }
      if (successMessage) {
        return successMessage;
      }
      return typeof res.message === "string"
        ? res.message
        : "Operación completada con éxito.";
    },
    error: (err: unknown) => {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      if (typeof errorMessage === "function") {
        return errorMessage(errorObj);
      }
      if (errorMessage) {
        return errorMessage;
      }
      return errorObj.message;
    },
  });

  try {
    const resolved = await promise;
    return resolved;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      await onError(errorObj);
    }

    if (capturedResponse) {
      return capturedResponse;
    }

    return {
      success: false,
      message: errorObj.message,
      error: errorObj.message,
    };
  }
}

/**
 * Backward-compatible alias for apiToast (used across projects like socialiticos and vidriera).
 *
 * @example
 * ```typescript
 * await toasted({
 *   action: () => deleteItemAction(id),
 *   loadingMessage: "Eliminando registro...",
 * });
 * ```
 */
export const toasted = apiToast;
