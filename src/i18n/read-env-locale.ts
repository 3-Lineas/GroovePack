import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";
import { normalizeSupportedLocale } from "@/i18n/is-supported-locale";

const ENV_LOCALE_KEYS = [
  "GROOVEPACK_LOCALE",
  "NEXT_PUBLIC_GROOVEPACK_LOCALE",
] as const;

function readLocaleFromProcessEnv(): GroovepackLocale | undefined {
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
  for (const key of ENV_LOCALE_KEYS) {
    const normalized = normalizeSupportedLocale(record[key]);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function readLocaleFromImportMeta(): GroovepackLocale | undefined {
  try {
    return (
      normalizeSupportedLocale(import.meta.env?.GROOVEPACK_LOCALE) ??
      normalizeSupportedLocale(import.meta.env?.NEXT_PUBLIC_GROOVEPACK_LOCALE)
    );
  } catch {
    return undefined;
  }
}

/**
 * Safely reads `GROOVEPACK_LOCALE` or `NEXT_PUBLIC_GROOVEPACK_LOCALE` in Vinext
 * (Cloudflare Workers + Vite 8 `ModuleRunner`) without dynamic `import.meta.env` access.
 */
export function readEnvLocale(): GroovepackLocale | undefined {
  return readLocaleFromProcessEnv() ?? readLocaleFromImportMeta();
}
