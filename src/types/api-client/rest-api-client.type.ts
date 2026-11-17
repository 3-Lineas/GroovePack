/**
 * Standardized REST API client returned by `createApiClient`.
 */
export interface RestApiClient {
  get: (path: string, init?: RequestInit) => Promise<Response>;
  post: (path: string, body?: unknown, init?: RequestInit) => Promise<Response>;
  put: (path: string, body?: unknown, init?: RequestInit) => Promise<Response>;
  patch: (path: string, body?: unknown, init?: RequestInit) => Promise<Response>;
  delete: (path: string, init?: RequestInit) => Promise<Response>;
  setToken: (token: string) => void;
  removeToken: () => void;
}
