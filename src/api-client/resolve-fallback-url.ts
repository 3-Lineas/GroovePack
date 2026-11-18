const PLACEHOLDER_ORIGIN = "http://groovepack.invalid";

/**
 * Rewrites `input` to `fallbackBaseUrl + pathname + search` while preserving
 * `Request` metadata when `input` is a `Request` instance.
 */
export function resolveFallbackUrl(
  input: RequestInfo | URL,
  fallbackBaseUrl: string,
): RequestInfo {
  const normalizedBase = fallbackBaseUrl.replace(/\/+$/, "");
  const rawUrl = input instanceof Request ? input.url : String(input);
  const parsed = new URL(rawUrl, PLACEHOLDER_ORIGIN);
  const targetUrl = `${normalizedBase}${parsed.pathname}${parsed.search}`;

  if (input instanceof Request) {
    return new Request(targetUrl, input);
  }

  return targetUrl;
}
