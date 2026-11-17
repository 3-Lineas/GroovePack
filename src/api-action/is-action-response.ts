import type { ActionResponse } from "@/types/common/action-response.type";

/**
 * Type guard verifying whether a value implements `ActionResponse<T>`.
 */
export function isActionResponse<T>(
  candidateValue: unknown,
): candidateValue is ActionResponse<T> {
  return (
    typeof candidateValue === "object" &&
    candidateValue !== null &&
    "success" in candidateValue &&
    typeof candidateValue.success === "boolean"
  );
}
