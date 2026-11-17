/**
 * Context contract required by `withD1Transaction`.
 */
export interface D1TransactionContext<TStatement = unknown> {
  stagedStatements: TStatement[];
}
