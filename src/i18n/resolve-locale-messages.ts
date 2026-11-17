import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";
import type { GroovepackLocaleMessages } from "@/types/i18n/locale-messages.type";
import { getGroovepackLocale } from "@/i18n/locale-state";
import { GROOVEPACK_MESSAGES } from "@/i18n/messages";

/**
 * Returns the localized message dictionary for the given override locale,
 * or the active runtime/environment/default (`"en"`) locale.
 */
export function resolveLocaleMessages(
  overrideLocale?: GroovepackLocale,
): GroovepackLocaleMessages {
  const activeLocale = getGroovepackLocale(overrideLocale);
  return GROOVEPACK_MESSAGES[activeLocale];
}
