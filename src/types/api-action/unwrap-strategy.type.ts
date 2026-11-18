/**
 * Internal strategy controlling how `unwrapActionResponse` handles failure or missing data.
 */
export type UnwrapStrategy<T> =
  | { mode: "fallback"; fallback: T }
  | { mode: "throw" };
