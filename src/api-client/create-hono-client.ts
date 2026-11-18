import { hc } from "hono/client";
import type { AnyHonoApp } from "@/types/api-client/any-hono-app.type";
import type { ApiClientConfig } from "@/types/api-client/api-client-config.type";
import { dispatchRequest } from "@/api-client/dispatch-request";
import { resolveHeaders } from "@/api-client/resolve-headers";

/**
 * Creates a typed Hono RPC client (`hc<TApp>()`) with automatic Bearer token injection,
 * dynamic per-request headers, and Cloudflare Service Binding support.
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
    getHeaders,
    serviceBinding,
    fallbackBaseUrl,
    fetcher = fetch,
  } = config;

  return hc<TApp>(baseUrl, {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const isFormData =
        typeof FormData !== "undefined" && init?.body instanceof FormData;
      const headers = await resolveHeaders({
        defaultHeaders,
        getHeaders,
        tokenStorageKey,
        getToken,
        extraHeaders: init?.headers,
        isFormData,
      });

      return dispatchRequest(
        input,
        {
          ...init,
          headers,
        },
        { serviceBinding, fallbackBaseUrl, fetcher },
      );
    },
  });
}
