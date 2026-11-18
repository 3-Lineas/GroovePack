import { hc } from "hono/client";
import type { AnyHonoApp } from "@/types/api-client/any-hono-app.type";
import type { ApiClientConfig } from "@/types/api-client/api-client-config.type";
import { resolveHeaders } from "@/api-client/resolve-headers";

/**
 * Creates a typed Hono RPC client (`hc<TApp>()`) with automatic Bearer token injection.
 * Requires `hono` to be installed in the consumer project.
 */
export function createHonoClient<TApp extends AnyHonoApp>(
  config: ApiClientConfig = {},
) {
  const {
    baseUrl = "",
    tokenStorageKey = "token",
    getToken,
    defaultHeaders,
    fetcher = fetch,
  } = config;

  return hc<TApp>(baseUrl, {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const isFormData =
        typeof FormData !== "undefined" && init?.body instanceof FormData;
      const headers = await resolveHeaders(
        defaultHeaders,
        tokenStorageKey,
        getToken,
        init?.headers,
        isFormData,
      );

      return fetcher(input, {
        ...init,
        headers,
      });
    },
  });
}
