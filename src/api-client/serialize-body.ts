/**
 * Serializes a request body to `BodyInit | undefined`, supporting `FormData`,
 * `URLSearchParams`, `Blob`, `string`, and JSON with `BigInt` safety.
 */
export function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob
  ) {
    return body;
  }

  return JSON.stringify(body, (_key, fieldValue) =>
    typeof fieldValue === "bigint" ? fieldValue.toString() : fieldValue,
  );
}
