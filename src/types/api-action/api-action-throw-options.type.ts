import type { ApiActionBaseOptions } from "@/types/api-action/api-action-base-options.type";

/**
 * Options for `apiAction` in unwrapped throwing mode, returning `Promise<T>` or throwing `Error`.
 */
export interface ApiActionThrowOptions<T = unknown>
  extends ApiActionBaseOptions<T> {
  /** Mutually exclusive with `throwOnError`. */
  fallback?: never;
  /** Throws an `Error` if the request fails or `data` is `undefined`. */
  throwOnError: true;
}
