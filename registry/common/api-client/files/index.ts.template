/**
 * @fileoverview Universal API Client Factory for REST and Hono RPC.
 * Provides unified HTTP methods, automatic authorization token injection,
 * BigInt-safe serialization, and optional Hono RPC client instantiation.
 *
 * @example
 * ```typescript
 * import { createApiClient, createHonoClient } from "@/lib/api-client";
 *
 * // Example A: REST Client (React, Next.js, Astro, Node)
 * export const api = createApiClient({
 *   baseUrl: "https://api.example.com",
 *   getToken: () => localStorage.getItem("token"),
 * });
 *
 * const response = await api.get("/users");
 * const data = await response.json();
 *
 * // Example B: Hono RPC Client with typed routes
 * import type { AppType } from "api";
 * export const rpc = createHonoClient<AppType>({
 *   baseUrl: "http://localhost:8787",
 * });
 * const res = await rpc.v1.products.$get();
 * ```
 */

import { hc } from "hono/client";
import type { Hono } from "hono";

/**
 * Configuration options for the API client.
 */
export interface ApiClientConfig {
  /**
   * Base URL for API requests.
   * Defaults to empty string in browser (relative to current origin) or "http://localhost:8787" in development.
   */
  baseUrl?: string;
  /**
   * Static or dynamic headers to attach to every request.
   */
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
  /**
   * Callback to retrieve the authentication token.
   * If provided and returns a valid string, an `Authorization: Bearer <token>` header is automatically attached.
   */
  getToken?: () => string | null | undefined | Promise<string | null | undefined>;
  /**
   * Storage key name used for default token management in browser localStorage.
   * Defaults to "auth_token".
   */
  tokenStorageKey?: string;
  /**
   * Custom fetch implementation (e.g. for testing, SSR or Cloudflare Service Bindings).
   */
  fetch?: typeof fetch;
}

/**
 * Universal REST API client interface.
 */
export interface RestApiClient {
  /** Performs a raw fetch request prepending the base URL and injecting auth headers */
  fetch: (path: string, init?: RequestInit) => Promise<Response>;
  /** Performs a GET request */
  get: (path: string, init?: RequestInit) => Promise<Response>;
  /** Performs a POST request with automatic JSON body serialization */
  post: (path: string, body?: unknown, init?: RequestInit) => Promise<Response>;
  /** Performs a PUT request with automatic JSON body serialization */
  put: (path: string, body?: unknown, init?: RequestInit) => Promise<Response>;
  /** Performs a PATCH request with automatic JSON body serialization */
  patch: (path: string, body?: unknown, init?: RequestInit) => Promise<Response>;
  /** Performs a DELETE request */
  delete: (path: string, init?: RequestInit) => Promise<Response>;
}

/**
 * Retrieves the stored authentication token from localStorage if running in browser.
 *
 * @param key - The localStorage key name (default: "auth_token").
 * @returns The token string if found, or null otherwise.
 */
export function getStoredToken(key = "auth_token"): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return localStorage.getItem(key);
}

/**
 * Saves the authentication token in localStorage if running in browser.
 *
 * @param token - The token string to persist.
 * @param key - The localStorage key name (default: "auth_token").
 */
export function setStoredToken(token: string, key = "auth_token"): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  localStorage.setItem(key, token);
}

/**
 * Removes the stored authentication token from localStorage if running in browser.
 *
 * @param key - The localStorage key name (default: "auth_token").
 */
export function removeStoredToken(key = "auth_token"): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  localStorage.removeItem(key);
}

/**
 * Resolves request headers merging base headers, custom headers, and dynamic auth token.
 */
async function resolveHeaders(
  config: ApiClientConfig,
  customHeaders?: HeadersInit,
): Promise<Headers> {
  const headers = new Headers(customHeaders);

  // 1. Resolve base config headers
  if (config.headers) {
    const baseHeaders =
      typeof config.headers === "function"
        ? await config.headers()
        : config.headers;

    for (const [key, value] of Object.entries(baseHeaders)) {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    }
  }

  // 2. Resolve Auth Token if not explicitly provided in custom headers
  if (!headers.has("Authorization")) {
    let token: string | null | undefined = null;

    if (config.getToken) {
      token = await config.getToken();
    } else {
      const storageKey = config.tokenStorageKey || "auth_token";
      token = getStoredToken(storageKey);
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

/**
 * Resolves the full target URL from relative path and base URL.
 */
function resolveUrl(baseUrl: string | undefined, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base = baseUrl || "";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  if (!cleanBase) {
    return `/${cleanPath}`;
  }

  return `${cleanBase}/${cleanPath}`;
}

/**
 * Serializes payload safely with BigInt support.
 */
function serializeBody(body: unknown): string | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }
  if (typeof body === "string") {
    return body;
  }
  if (body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
    return body as unknown as string;
  }

  return JSON.stringify(body, (_key, value) =>
    typeof value === "bigint" ? Number(value) : value,
  );
}

/**
 * Factory function to create a universal REST API client with automatic token injection.
 *
 * @example
 * ```typescript
 * import { createApiClient } from "@/lib/api-client";
 *
 * export const api = createApiClient({
 *   baseUrl: "https://api.myapp.com/v1",
 *   tokenStorageKey: "app_token",
 * });
 *
 * // Performs GET https://api.myapp.com/v1/customers with Bearer token
 * const response = await api.get("/customers");
 * ```
 *
 * @param config - Client configuration settings.
 * @returns Instantiated RestApiClient object.
 */
export function createApiClient(config: ApiClientConfig = {}): RestApiClient {
  const fetchFn = config.fetch || fetch;

  const request = async (path: string, init: RequestInit = {}): Promise<Response> => {
    const fullUrl = resolveUrl(config.baseUrl, path);
    const headers = await resolveHeaders(config, init.headers);

    const isPayload = init.body !== undefined && init.body !== null;
    const isFormData = init.body instanceof FormData;

    if (isPayload && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetchFn(fullUrl, {
      ...init,
      headers,
    });
  };

  return {
    fetch: request,
    get: (path, init) => request(path, { ...init, method: "GET" }),
    post: (path, body, init) =>
      request(path, {
        ...init,
        method: "POST",
        body: serializeBody(body),
      }),
    put: (path, body, init) =>
      request(path, {
        ...init,
        method: "PUT",
        body: serializeBody(body),
      }),
    patch: (path, body, init) =>
      request(path, {
        ...init,
        method: "PATCH",
        body: serializeBody(body),
      }),
    delete: (path, init) => request(path, { ...init, method: "DELETE" }),
  };
}

/**
 * Factory function to instantiate a strongly-typed Hono RPC client (`hc<TRouter>`) with auth injection.
 *
 * @template TRouter - Hono router or application type (e.g. `AppType`).
 * @example
 * ```typescript
 * import { createHonoClient } from "@/lib/api-client";
 * import type { AppType } from "api";
 *
 * export const api = createHonoClient<AppType>({
 *   baseUrl: "http://localhost:8787",
 * });
 *
 * // Fully typed autocomplete on backend routes
 * const res = await api.v1.sales.$post({ json: saleData });
 * ```
 *
 * @param config - Client configuration options.
 * @returns Instantiated typed Hono RPC client.
 */
export function createHonoClient<TRouter extends Hono<any, any, any>>(
  config: ApiClientConfig = {},
): ReturnType<typeof hc<TRouter>> {
  const baseUrl = config.baseUrl || "http://localhost:8787";

  return hc<TRouter>(baseUrl, {
    headers: async () => {
      const headers = await resolveHeaders(config);
      const record: Record<string, string> = {};
      headers.forEach((val, key) => {
        record[key] = val;
      });
      return record;
    },
    fetch: config.fetch,
  });
}
