import type { PipeAction } from "@/types/pipeline/pipe-action.type";
import type { BatchCapableDb } from "@/types/pipeline/batch-capable-db.type";

export type { PipeAction } from "@/types/pipeline/pipe-action.type";
export type { BatchCapableDb } from "@/types/pipeline/batch-capable-db.type";

/**
 * Pipeline orchestrator inspired by Laravel's Pipeline pattern.
 * Supports sequential pipe execution and optional atomic Cloudflare D1 batching
 * via `.transactional(db)`.
 */
export class Pipeline<TContext> {
  private readonly context: TContext;
  private pipes: PipeAction<TContext, TContext>[] = [];
  private dbInstance: BatchCapableDb | null = null;
  private isTransactional = false;

  private constructor(context: TContext) {
    this.context = context;
  }

  /**
   * Initializes a new pipeline with the given initial context.
   */
  public static send<TInitial>(context: TInitial): Pipeline<TInitial> {
    return new Pipeline(context);
  }

  /**
   * Enables transactional mode using Cloudflare D1 `db.batch()`.
   * Pipes must push statements onto `context.stagedStatements` instead of
   * executing them immediately.
   */
  public transactional(db: BatchCapableDb): this {
    this.dbInstance = db;
    this.isTransactional = true;
    return this;
  }

  /**
   * Registers the ordered list of pipe actions to execute.
   */
  public through(pipes: PipeAction<TContext, TContext>[]): this {
    this.pipes = pipes;
    return this;
  }

  /**
   * Executes all registered pipes sequentially and optionally passes the final
   * context to a destination closure.
   */
  public async then<TResult = TContext>(
    destination?: (context: TContext) => Promise<TResult> | TResult,
  ): Promise<TResult> {
    let currentContext = this.context;

    try {
      for (const pipe of this.pipes) {
        currentContext = await pipe(currentContext);
      }

      if (
        this.isTransactional &&
        this.dbInstance &&
        this.hasStagedStatements(currentContext) &&
        currentContext.stagedStatements.length > 0
      ) {
        await this.dbInstance.batch(currentContext.stagedStatements);
      }

      if (destination) {
        return await destination(currentContext);
      }

      return currentContext as unknown as TResult;
    } catch (caughtError) {
      if (this.isTransactional && this.hasStagedStatements(currentContext)) {
        currentContext.stagedStatements = [];
      }
      throw caughtError;
    }
  }

  private hasStagedStatements(
    candidate: unknown,
  ): candidate is { stagedStatements: unknown[] } {
    return (
      typeof candidate === "object" &&
      candidate !== null &&
      "stagedStatements" in candidate &&
      Array.isArray((candidate as { stagedStatements: unknown }).stagedStatements)
    );
  }
}
