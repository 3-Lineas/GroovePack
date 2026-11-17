import type { ActionResponse } from "@/types/common/action-response.type";
import type { MinimalResponse } from "@/types/api-action/minimal-response.type";

/**
 * Supported return types from an `apiCall` passed to `apiAction`.
 */
export type ApiCallResult<T> = MinimalResponse | ActionResponse<T>;
