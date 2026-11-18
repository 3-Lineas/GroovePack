import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";
import { readEnvLocale } from "@/i18n/read-env-locale";

/**
 * Resolves the active locale strictly from environment variables
 * (`GROOVEPACK_LOCALE` or `NEXT_PUBLIC_GROOVEPACK_LOCALE`), defaulting to `"en"`.
 */
export function getGroovepackLocale(): GroovepackLocale {
  return readEnvLocale() ?? "en";
}
