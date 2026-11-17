/**
 * Safely persists a token to `globalThis.localStorage` when running in a browser.
 */
export function setStoredToken(storageKey: string, token: string): void {
  try {
    if (
      typeof globalThis !== "undefined" &&
      "localStorage" in globalThis &&
      globalThis.localStorage
    ) {
      globalThis.localStorage.setItem(storageKey, token);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}
