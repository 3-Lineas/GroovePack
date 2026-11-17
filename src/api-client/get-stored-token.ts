/**
 * Safely reads a stored token from `globalThis.localStorage` when running in a browser.
 */
export function getStoredToken(storageKey: string): string | null {
  try {
    if (
      typeof globalThis !== "undefined" &&
      "localStorage" in globalThis &&
      globalThis.localStorage
    ) {
      return globalThis.localStorage.getItem(storageKey);
    }
  } catch {
    return null;
  }
  return null;
}
