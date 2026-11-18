import type { ApiActionBaseOptions } from "@/types/api-action/api-action-base-options.type";

/**
 * Default options for `apiAction`, returning a standardized `ActionResponse<T>`.
 */
export interface ApiActionOptions<T = unknown> extends ApiActionBaseOptions<T> {
  /** Disallowed in default `ActionResponse` mode. */
  fallback?: never;
  /** Disallowed in default `ActionResponse` mode. */
  throwOnError?: never;
}
