/**
 * @fileoverview Type definitions for Laravel-style Pipeline and atomic Cloudflare D1 batching.
 * Agnostic to whether the consumer uses Drizzle ORM or native Cloudflare D1 (D1Database).
 */

/**
 * Individual action contract in the pipeline.
 * Follows the single input / single output rule:
 * `(context: TContext) => Promise<TContext> | TContext`.
 */
export type PipeAction<TIn, TOut = TIn> = (
  context: TIn,
) => Promise<TOut> | TOut;

/**
 * Generic minimal interface for database clients supporting atomic batching.
 * Satisfied natively by Cloudflare D1 (`D1Database`) and Drizzle ORM (`DrizzleD1Database`).
 */
export interface BatchCapableDb<TStatement = unknown, TResult = unknown> {
  batch(statements: TStatement[]): Promise<TResult[] | unknown>;
}

/**
 * Transactional context supplied to the pipeline or withD1Transaction.
 * Allows immediate read queries via `db` and stages mutations for atomic batch execution.
 *
 * @template TDb - The type of database client (e.g. `D1Database` or Drizzle client).
 * @template TStatement - The type of statement staged for batching (e.g. `D1PreparedStatement` or Drizzle `BatchItem`).
 */
export interface D1TransactionContext<TDb = unknown, TStatement = unknown> {
  /** Database client for immediate read queries */
  readonly db: TDb;
  /** Enqueues one or more statements to be committed atomically in db.batch() */
  stage: (...statements: TStatement[]) => void;
}
