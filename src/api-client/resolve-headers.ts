import type { ResolveHeadersOptions } from "@/types/api-client/resolve-headers-options.type";
import { getStoredToken } from "@/api-client/get-stored-token";

/**
 * Resolves request headers by merging `defaultHeaders`, `getHeaders()`,
 * `Content-Type: application/json` (when not FormData), per-request `extraHeaders`,
 * and `Authorization: Bearer`.
 */
export async function resolveHeaders(
  options: ResolveHeadersOptions,
): Promise<Headers> {
  const {
    defaultHeaders,
    getHeaders,
    tokenStorageKey,
    getToken,
    extraHeaders,
    isFormData = false,
  } = options;

  const headers = new Headers(defaultHeaders);

  if (getHeaders) {
    const dynamicHeaders = await getHeaders();
    new Headers(dynamicHeaders).forEach((headerValue, headerKey) => {
      headers.set(headerKey, headerValue);
    });
  }

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (extraHeaders) {
    new Headers(extraHeaders).forEach((headerValue, headerKey) => {
      headers.set(headerKey, headerValue);
    });
  }

  const token = getToken ? await getToken() : getStoredToken(tokenStorageKey);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}
