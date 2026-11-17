import type { BatchCapableDb } from "@/types/pipeline/batch-capable-db.type";
import type { D1TransactionContext } from "@/types/pipeline/d1-transaction-context.type";

export type { D1TransactionContext } from "@/types/pipeline/d1-transaction-context.type";

/**
 * Standalone helper to execute staged D1 statements atomically via `db.batch()`,
 * clearing staged statements on error as a preventive in-memory rollback.
 */
export async function withD1Transaction<
  TContext extends D1TransactionContext<TStatement>,
  TStatement = unknown,
>(
  db: BatchCapableDb<TStatement>,
  context: TContext,
  work: (transactionContext: TContext) => Promise<void> | void,
): Promise<TContext> {
  try {
    await work(context);

    if (context.stagedStatements.length > 0) {
      await db.batch(context.stagedStatements);
    }

    return context;
  } catch (caughtError) {
    context.stagedStatements = [];
    throw caughtError;
  }
}
