/**
 * Configuration options for `createApiClient`.
 */
export interface ApiClientConfig {
  /** Base API URL (e.g. `https://api.example.com`). */
  baseUrl?: string;
  /** Storage key used when reading/writing JWTs from `localStorage`. Defaults to `"token"`. */
  tokenStorageKey?: string;
  /** Optional async or sync token provider (e.g. from cookies or session). */
  getToken?: () => string | null | Promise<string | null>;
  /** Additional static headers merged into every request. */
  defaultHeaders?: Record<string, string>;
  /** Custom `fetch` implementation (useful in SSR, Cloudflare Workers, or tests). */
  fetcher?: typeof fetch;
}
