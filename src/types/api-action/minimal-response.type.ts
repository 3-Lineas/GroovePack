/**
 * Minimal `Response`-like contract compatible with `fetch`, Hono `ClientResponse`,
 * and custom test mocks.
 */
export interface MinimalResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}
