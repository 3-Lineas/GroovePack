import type { ApiActionBaseOptions } from "@/types/api-action/api-action-base-options.type";

/**
 * Options for `apiAction` in unwrapped fallback mode, returning `Promise<T>` directly.
 */
export interface ApiActionWithFallbackOptions<T = unknown>
  extends ApiActionBaseOptions<T> {
  /** Fallback value returned when the request fails or `data` is `undefined`. */
  fallback: NoInfer<T>;
  /** Mutually exclusive with `fallback`. */
  throwOnError?: never;
}
