import type { ApiClientConfig } from "@/types/api-client/api-client-config.type";
import type { RestApiClient } from "@/types/api-client/rest-api-client.type";
import { dispatchRequest } from "@/api-client/dispatch-request";
import { resolveHeaders } from "@/api-client/resolve-headers";
import { resolveUrl } from "@/api-client/resolve-url";
import { serializeBody } from "@/api-client/serialize-body";
import { setStoredToken } from "@/api-client/set-stored-token";
import { removeStoredToken } from "@/api-client/remove-stored-token";

/**
 * Creates a standardized REST API client with automatic Bearer token injection,
 * dynamic per-request headers, Cloudflare Service Binding support,
 * `BigInt`-safe JSON serialization, and `FormData` support.
 */
export function createApiClient(config: ApiClientConfig = {}): RestApiClient {
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

  async function request(
    method: string,
    path: string,
    body?: unknown,
    init?: RequestInit,
  ): Promise<Response> {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    const headers = await resolveHeaders({
      defaultHeaders,
      getHeaders,
      tokenStorageKey,
      getToken,
      extraHeaders: init?.headers,
      isFormData,
    });

    return dispatchRequest(
      resolveUrl(baseUrl, path),
      {
        ...init,
        method,
        headers,
        body: serializeBody(body),
      },
      { serviceBinding, fallbackBaseUrl, fetcher },
    );
  }

  return {
    get: (path, init) => request("GET", path, undefined, init),
    post: (path, body, init) => request("POST", path, body, init),
    put: (path, body, init) => request("PUT", path, body, init),
    patch: (path, body, init) => request("PATCH", path, body, init),
    delete: (path, init) => request("DELETE", path, undefined, init),
    setToken: (token) => setStoredToken(tokenStorageKey, token),
    removeToken: () => removeStoredToken(tokenStorageKey),
  };
}
