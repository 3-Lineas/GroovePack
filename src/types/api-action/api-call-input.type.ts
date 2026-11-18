import type { ApiCallResult } from "@/types/api-action/api-call-result.type";

/**
 * Accepted `apiCall` input for `apiAction`: either a deferred factory or a direct `Promise`.
 */
export type ApiCallInput<T> =
  | (() => Promise<ApiCallResult<T>>)
  | Promise<ApiCallResult<T>>;
