import type { BaseUiToastPayload } from "@/types/api-toast/base-ui-toast-payload.type";

/**
 * Contract for `@base-ui/react/toast` manager (`Toast.createToastManager()`).
 */
export interface BaseUiToastManager {
  add: (options: BaseUiToastPayload) => string;
  update: (id: string, updates: BaseUiToastPayload) => void;
  close: (id: string) => void;
}
