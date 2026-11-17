import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";

const SUPPORTED_LOCALE_SET = new Set<string>(["en", "es", "pt", "it", "fr"]);

/**
 * Normalizes a candidate locale string (e.g. "es-AR" -> "es") and returns
 * a supported `GroovepackLocale`, or `undefined` if unsupported.
 */
export function normalizeSupportedLocale(
  candidate: unknown,
): GroovepackLocale | undefined {
  if (typeof candidate !== "string") {
    return undefined;
  }

  const trimmed = candidate.trim().toLowerCase();
  if (trimmed.length === 0) {
    return undefined;
  }

  const baseTag = trimmed.split(/[-_]/)[0];
  if (!baseTag || !SUPPORTED_LOCALE_SET.has(baseTag)) {
    return undefined;
  }

  return baseTag as GroovepackLocale;
}
