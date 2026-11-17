import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";
import { normalizeSupportedLocale } from "@/i18n/is-supported-locale";

const ENV_LOCALE_KEYS = [
  "GROOVEPACK_LOCALE",
  "NEXT_PUBLIC_GROOVEPACK_LOCALE",
  "VITE_GROOVEPACK_LOCALE",
  "PUBLIC_GROOVEPACK_LOCALE",
] as const;

function readLocaleFromRecord(
  record: Record<string, unknown> | undefined,
): GroovepackLocale | undefined {
  if (!record) {
    return undefined;
  }

  for (const key of ENV_LOCALE_KEYS) {
    const normalized = normalizeSupportedLocale(record[key]);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function getProcessEnvRecord(): Record<string, unknown> | undefined {
  const globalRecord = globalThis as Record<string, unknown>;
  const processValue = globalRecord["process"];
  if (typeof processValue !== "object" || processValue === null) {
    return undefined;
  }

  const envValue = (processValue as Record<string, unknown>)["env"];
  if (typeof envValue !== "object" || envValue === null) {
    return undefined;
  }

  return envValue as Record<string, unknown>;
}

function getImportMetaEnvRecord(): Record<string, unknown> | undefined {
  const metaValue = import.meta as unknown as Record<string, unknown> | undefined;
  if (typeof metaValue !== "object" || metaValue === null) {
    return undefined;
  }

  const envValue = metaValue["env"];
  if (typeof envValue !== "object" || envValue === null) {
    return undefined;
  }

  return envValue as Record<string, unknown>;
}

/**
 * Safely reads `GROOVEPACK_LOCALE` (or framework-prefixed equivalents)
 * across Node.js, Cloudflare Workers, Next.js, Vite, and Astro without
 * requiring `@types/node` or Vite ambient types.
 */
export function readEnvLocale(): GroovepackLocale | undefined {
  return (
    readLocaleFromRecord(getProcessEnvRecord()) ??
    readLocaleFromRecord(getImportMetaEnvRecord())
  );
}
