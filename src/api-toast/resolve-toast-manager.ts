import type { BaseUiToastManager } from "@/types/api-toast/base-ui-toast-manager.type";
import { readShadcnUiPath } from "@/api-toast/read-shadcn-ui-path";

const toastManagerCache = new Map<string, BaseUiToastManager>();

function buildMissingShadcnToastMessage(toastModulePath: string): string {
  return (
    `[@3lineas/groovepack/api-toast] Could not load a valid Shadcn toastManager from "${toastModulePath}". ` +
    'Run "pnpm dlx shadcn@latest add toast" or set GROOVEPACK_SHADCN_PATH / NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH to your Shadcn UI directory.'
  );
}

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

function extractToastManager(loadedModule: unknown): BaseUiToastManager | undefined {
  if (typeof loadedModule !== "object" || loadedModule === null) {
    return undefined;
  }

  const record = loadedModule as Record<string, unknown>;
  const candidate = record["toastManager"] ?? record["toast"] ?? record["default"];

  return isValidToastManager(candidate) ? candidate : undefined;
}

/**
 * Automatically resolves the Shadcn `toastManager` from `${shadcnPath}/toast`
 * (default `"/src/components/ui/toast"`) or throws a descriptive error.
 */
export async function resolveToastManager(): Promise<BaseUiToastManager> {
  const toastModulePath = `${readShadcnUiPath()}/toast`;
  const cached = toastManagerCache.get(toastModulePath);
  if (cached) {
    return cached;
  }

  const missingMessage = buildMissingShadcnToastMessage(toastModulePath);

  try {
    const loadedModule: unknown = await import(/* @vite-ignore */ toastModulePath);
    const manager = extractToastManager(loadedModule);

    if (!manager) {
      console.error(missingMessage);
      throw new Error(missingMessage);
    }

    toastManagerCache.set(toastModulePath, manager);
    return manager;
  } catch (caughtError) {
    if (caughtError instanceof Error && caughtError.message === missingMessage) {
      throw caughtError;
    }

    console.error(missingMessage);
    throw new Error(missingMessage);
  }
}
