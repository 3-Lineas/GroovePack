import { getStoredToken } from "@/api-client/get-stored-token";

/**
 * Resolves request headers by merging `defaultHeaders`, per-request headers,
 * `Content-Type: application/json` (when not FormData), and `Authorization: Bearer`.
 */
export async function resolveHeaders(
  defaultHeaders: Record<string, string> | undefined,
  tokenStorageKey: string,
  getToken: (() => string | null | Promise<string | null>) | undefined,
  extraHeaders?: HeadersInit,
  isFormData = false,
): Promise<Headers> {
  const headers = new Headers(defaultHeaders);

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
