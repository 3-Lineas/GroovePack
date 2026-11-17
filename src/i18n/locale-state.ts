import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";
import { normalizeSupportedLocale } from "@/i18n/is-supported-locale";
import { readEnvLocale } from "@/i18n/read-env-locale";

let configuredLocale: GroovepackLocale | undefined;

/**
 * Sets the global runtime locale for `@3lineas/groovepack` fallback messages.
 * Pass `undefined` to clear the runtime override and fall back to environment
 * variables or `"en"`.
 */
export function setGroovepackLocale(locale: GroovepackLocale | undefined): void {
  if (locale === undefined) {
    configuredLocale = undefined;
    return;
  }

  configuredLocale = normalizeSupportedLocale(locale);
}

/**
 * Resolves the active locale using precedence:
 * 1. Explicit `overrideLocale`
 * 2. Runtime locale set via `setGroovepackLocale()`
 * 3. Environment variable (`GROOVEPACK_LOCALE` / framework-prefixed)
 * 4. Default `"en"`
 */
export function getGroovepackLocale(
  overrideLocale?: GroovepackLocale,
): GroovepackLocale {
  return (
    normalizeSupportedLocale(overrideLocale) ??
    configuredLocale ??
    readEnvLocale() ??
    "en"
  );
}
