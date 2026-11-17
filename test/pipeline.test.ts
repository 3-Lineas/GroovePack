import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Pipeline } from "../src/pipeline/pipeline.js";
import {
  withD1Transaction,
  type D1TransactionContext,
} from "../src/pipeline/with-d1-transaction.js";


describe("Pipeline & withD1Transaction", () => {
  it("executes pipes sequentially and returns enriched context", async () => {
    interface Ctx {
      count: number;
      steps: string[];
    }

    const result = await Pipeline.send<Ctx>({ count: 1, steps: [] })
      .through([
        (ctx) => ({ count: ctx.count + 1, steps: [...ctx.steps, "a"] }),
        async (ctx) => ({ count: ctx.count * 10, steps: [...ctx.steps, "b"] }),
      ])
      .then();

    assert.equal(result.count, 20);
    assert.deepEqual(result.steps, ["a", "b"]);
  });

  it("supports .then() destination closure", async () => {
    const finalValue = await Pipeline.send({ value: 5 })
      .through([(ctx) => ({ value: ctx.value + 3 })])
      .then((ctx) => ctx.value * 2);

    assert.equal(finalValue, 16);
  });

  it("commits staged statements atomically via db.batch() in transactional mode", async () => {
    const batched: (readonly unknown[])[] = [];
    const mockDb = {
      batch: async (stmts: readonly unknown[]) => {
        batched.push(stmts);
        return stmts.map(() => ({ success: true }));
      },
    };

    interface TxCtx {
      stagedStatements: string[];
    }

    await Pipeline.send<TxCtx>({ stagedStatements: [] })
      .transactional(mockDb)
      .through([
        (ctx) => {
          ctx.stagedStatements.push("INSERT INTO users VALUES (1)");
          return ctx;
        },
        (ctx) => {
          ctx.stagedStatements.push("INSERT INTO logs VALUES ('created')");
          return ctx;
        },
      ])
      .then();

    assert.equal(batched.length, 1);
    assert.deepEqual(batched[0], [
      "INSERT INTO users VALUES (1)",
      "INSERT INTO logs VALUES ('created')",
    ]);
  });

  it("performs preventive in-memory rollback when a pipe throws", async () => {
    const batched: (readonly unknown[])[] = [];
    const mockDb = {
      batch: async (stmts: readonly unknown[]) => {
        batched.push(stmts);
        return [];
      },
    };

    interface TxCtx {
      stagedStatements: string[];
    }

    await assert.rejects(
      () =>
        Pipeline.send<TxCtx>({ stagedStatements: [] })
          .transactional(mockDb)
          .through([
            (ctx) => {
              ctx.stagedStatements.push("INSERT INTO users VALUES (1)");
              return ctx;
            },
            () => {
              throw new Error("Domain validation failed");
            },
          ])
          .then(),
      /Domain validation failed/,
    );

    assert.equal(batched.length, 0);
  });

  it("withD1Transaction batches staged statements and skips batch when empty", async () => {
    const batched: (readonly unknown[])[] = [];
    const mockDb = {
      batch: async (stmts: readonly unknown[]) => {
        batched.push(stmts);
        return [];
      },
    };

    const res = await withD1Transaction(
      mockDb,
      { stagedStatements: [] as string[] },
      async (tx) => {
        tx.stagedStatements.push("UPDATE accounts SET balance = 100");
      },
    );
    assert.deepEqual(res.stagedStatements, ["UPDATE accounts SET balance = 100"]);
    assert.equal(batched.length, 1);

    await withD1Transaction(
      mockDb,
      { stagedStatements: [] as string[] },
      async () => {},
    );
    assert.equal(batched.length, 1);
  });
});
