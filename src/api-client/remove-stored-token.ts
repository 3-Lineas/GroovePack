/**
 * Safely removes a stored token from `globalThis.localStorage` when running in a browser.
 */
export function removeStoredToken(storageKey: string): void {
  try {
    if (
      typeof globalThis !== "undefined" &&
      "localStorage" in globalThis &&
      globalThis.localStorage
    ) {
      globalThis.localStorage.removeItem(storageKey);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}
