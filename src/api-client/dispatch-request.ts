import type { DispatchRequestOptions } from "@/types/api-client/dispatch-request-options.type";
import { resolveFallbackUrl } from "@/api-client/resolve-fallback-url";
import { resolveServiceBinding } from "@/api-client/resolve-service-binding";

/**
 * Dispatches an HTTP request through a Cloudflare Service Binding when available,
 * falling back to `fallbackBaseUrl + pathname + search` or the configured `fetcher`.
 */
export async function dispatchRequest(
  input: RequestInfo | URL,
  init: RequestInit,
  options: DispatchRequestOptions,
  resolveBinding: typeof resolveServiceBinding = resolveServiceBinding,
): Promise<Response> {
  const { serviceBinding, fallbackBaseUrl, fetcher = fetch } = options;

  if (serviceBinding && serviceBinding.trim().length > 0) {
    const bindingFetch = await resolveBinding(serviceBinding);
    if (bindingFetch) {
      return bindingFetch(input, init);
    }

    if (fallbackBaseUrl && fallbackBaseUrl.trim().length > 0) {
      return fetcher(resolveFallbackUrl(input, fallbackBaseUrl), init);
    }
  }

  return fetcher(input, init);
}
