/**
 * Minimal database contract compatible with Cloudflare D1 (`db.batch`) and Drizzle D1.
 */
export interface BatchCapableDb<TStatement = unknown, TResult = unknown> {
  batch: (statements: readonly TStatement[]) => Promise<readonly TResult[]>;
}
