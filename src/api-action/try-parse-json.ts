/**
 * Safely parses JSON from a `MinimalResponse`, returning `null` if parsing fails.
 */
export async function tryParseJson(
  response: { json: () => Promise<unknown> },
): Promise<Record<string, unknown> | null> {
  try {
    const parsed = await response.json();
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}
