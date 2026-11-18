import type { GroovepackLocaleMessages } from "@/types/i18n/locale-messages.type";
import { getGroovepackLocale } from "@/i18n/locale-state";
import { GROOVEPACK_MESSAGES } from "@/i18n/messages";

/**
 * Returns the localized message dictionary resolved from environment variables
 * or the default `"en"` locale.
 */
export function resolveLocaleMessages(): GroovepackLocaleMessages {
  const activeLocale = getGroovepackLocale();
  return GROOVEPACK_MESSAGES[activeLocale];
}
