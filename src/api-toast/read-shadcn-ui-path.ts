const DEFAULT_SHADCN_UI_PATH = "/src/components/ui";

const ENV_SHADCN_PATH_KEYS = [
  "GROOVEPACK_SHADCN_PATH",
  "NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH",
] as const;

function normalizePath(candidate: unknown): string | undefined {
  if (typeof candidate !== "string") {
    return undefined;
  }

  const trimmed = candidate.trim().replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : undefined;
}

function readShadcnPathFromProcessEnv(): string | undefined {
  const globalRecord = globalThis as Record<string, unknown>;
  const processValue = globalRecord["process"];
  if (typeof processValue !== "object" || processValue === null) {
    return undefined;
  }

  const envValue = (processValue as Record<string, unknown>)["env"];
  if (typeof envValue !== "object" || envValue === null) {
    return undefined;
  }

  const record = envValue as Record<string, unknown>;
  for (const key of ENV_SHADCN_PATH_KEYS) {
    const normalized = normalizePath(record[key]);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function readShadcnPathFromImportMeta(): string | undefined {
  try {
    return (
      normalizePath(import.meta.env?.GROOVEPACK_SHADCN_PATH) ??
      normalizePath(import.meta.env?.NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH)
    );
  } catch {
    return undefined;
  }
}

/**
 * Resolves the Shadcn UI base directory from `GROOVEPACK_SHADCN_PATH` or
 * `NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH`, defaulting to `"/src/components/ui"`.
 */
export function readShadcnUiPath(): string {
  return (
    readShadcnPathFromProcessEnv() ??
    readShadcnPathFromImportMeta() ??
    DEFAULT_SHADCN_UI_PATH
  );
}
