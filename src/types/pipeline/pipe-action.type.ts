/**
 * Minimal pipe contract: receives the current context and returns the next context.
 */
export type PipeAction<TIn, TOut = TIn> = (
  context: TIn,
) => Promise<TOut> | TOut;
