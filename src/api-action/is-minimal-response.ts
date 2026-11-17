import type { MinimalResponse } from "@/types/api-action/minimal-response.type";

/**
 * Type guard verifying whether a value implements `MinimalResponse`.
 */
export function isMinimalResponse(
  candidateValue: unknown,
): candidateValue is MinimalResponse {
  return (
    typeof candidateValue === "object" &&
    candidateValue !== null &&
    "ok" in candidateValue &&
    typeof candidateValue.ok === "boolean" &&
    "status" in candidateValue &&
    typeof candidateValue.status === "number" &&
    "json" in candidateValue &&
    typeof candidateValue.json === "function"
  );
}
