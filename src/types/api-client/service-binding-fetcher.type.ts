/**
 * Structural contract for a Cloudflare Worker Service Binding `Fetcher`.
 */
export interface ServiceBindingFetcher {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}
