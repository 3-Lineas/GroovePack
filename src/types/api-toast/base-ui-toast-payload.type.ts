/**
 * Toast payload accepted by `@base-ui/react/toast` (`Toast.createToastManager()`).
 */
export interface BaseUiToastPayload {
  title?: string;
  description?: string;
  type?: "loading" | "success" | "error" | "info" | "warning" | (string & {});
}
