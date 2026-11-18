import type { BaseUiToastManager } from "@/types/api-toast/base-ui-toast-manager.type";

const MISSING_SHADCN_TOAST_MESSAGE =
  '[@3lineas/groovepack/api-toast] Shadcn Toast (@base-ui/react/toast) is not installed or configured. Run "pnpm dlx shadcn@latest add toast" and ensure "@base-ui/react" is installed.';

let defaultToastManager: BaseUiToastManager | undefined;

function isValidToastManager(
  candidate: unknown,
): candidate is BaseUiToastManager {
  if (typeof candidate !== "object" || candidate === null) {
    return false;
  }

  const record = candidate as Record<string, unknown>;
  return (
    typeof record["add"] === "function" &&
    typeof record["update"] === "function"
  );
}

/**
 * Resolves the active `@base-ui/react/toast` manager or throws a descriptive
 * error when Shadcn Toast (`@base-ui/react/toast`) is not installed.
 */
export async function resolveToastManager(
  customToast?: BaseUiToastManager,
): Promise<BaseUiToastManager> {
  if (customToast !== undefined) {
    if (!isValidToastManager(customToast)) {
      console.error(MISSING_SHADCN_TOAST_MESSAGE);
      throw new Error(MISSING_SHADCN_TOAST_MESSAGE);
    }

    return customToast;
  }

  if (defaultToastManager) {
    return defaultToastManager;
  }

  try {
    const baseUiToastModule = (await import("@base-ui/react/toast")) as {
      Toast?: { createToastManager?: () => BaseUiToastManager };
      createToastManager?: () => BaseUiToastManager;
    };
    const factory =
      baseUiToastModule.Toast?.createToastManager ??
      baseUiToastModule.createToastManager;

    if (typeof factory !== "function") {
      throw new Error(MISSING_SHADCN_TOAST_MESSAGE);
    }

    const created = factory();
    if (!isValidToastManager(created)) {
      throw new Error(MISSING_SHADCN_TOAST_MESSAGE);
    }

    defaultToastManager = created;
    return defaultToastManager;
  } catch {
    console.error(MISSING_SHADCN_TOAST_MESSAGE);
    throw new Error(MISSING_SHADCN_TOAST_MESSAGE);
  }
}
