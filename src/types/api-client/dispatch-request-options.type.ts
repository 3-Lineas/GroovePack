/**
 * Options for dispatching an HTTP request via Service Binding, fallback URL, or custom `fetcher`.
 */
export interface DispatchRequestOptions {
  serviceBinding?: string;
  fallbackBaseUrl?: string;
  fetcher?: typeof fetch;
}
