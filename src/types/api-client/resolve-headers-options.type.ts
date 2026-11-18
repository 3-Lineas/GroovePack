/**
 * Parameters for resolving per-request HTTP headers.
 */
export interface ResolveHeadersOptions {
  defaultHeaders?: Record<string, string>;
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  tokenStorageKey: string;
  getToken?: () => string | null | Promise<string | null>;
  extraHeaders?: HeadersInit;
  isFormData?: boolean;
}
