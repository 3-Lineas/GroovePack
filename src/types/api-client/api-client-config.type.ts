/**
 * Configuration options for `createApiClient`.
 */
export interface ApiClientConfig {
  /** Base API URL (e.g. `https://api.example.com` or `http://api.local/api`). */
  baseUrl?: string;
  /** Storage key used when reading/writing JWTs from `localStorage`. Defaults to `"token"`. */
  tokenStorageKey?: string;
  /** Optional async or sync token provider (e.g. from cookies or session). */
  getToken?: () => string | null | Promise<string | null>;
  /** Additional static headers merged into every request. */
  defaultHeaders?: Record<string, string>;
  /** Optional async or sync per-request headers merged after `defaultHeaders` and before `init.headers`. */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  /** Optional Cloudflare Worker Service Binding name read from `env[serviceBinding]` via `cloudflare:workers`. */
  serviceBinding?: string;
  /** Fallback origin/base URL used when `serviceBinding` is configured but unavailable (e.g. `"http://127.0.0.1:8787"`). */
  fallbackBaseUrl?: string;
  /** Custom `fetch` implementation (useful in SSR, Cloudflare Workers, or tests). */
  fetcher?: typeof fetch;
}
