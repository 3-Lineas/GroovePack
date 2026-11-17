import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { logger } from "../src/logger/index.js";

describe("Logger", () => {
  it("logs formatted ANSI output in development/test mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";
    const originalLog = console.log;
    const calls: unknown[][] = [];
    console.log = (...args: unknown[]) => calls.push(args);

    try {
      // using singleton logger
      logger.info("User logged in", { file: "auth.ts", line: 10, userId: "u1" });
      assert.equal(calls.length, 1);
      assert.match(String(calls[0]?.[0]), /\[INFO\]/);
    } finally {
      console.log = originalLog;
      process.env.NODE_ENV = originalEnv;
    }
  });

  it("logs structured JSON in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const logCalls: string[] = [];
    const warnCalls: string[] = [];
    const errorCalls: string[] = [];

    console.log = (msg: unknown) => logCalls.push(String(msg));
    console.warn = (msg: unknown) => warnCalls.push(String(msg));
    console.error = (msg: unknown) => errorCalls.push(String(msg));

    try {
      // using singleton logger
      logger.info("Order created", { orderId: 123 });
      logger.warn("Low stock", { sku: "ABC" });
      logger.error("DB failure", { code: "E_DB", error: "boom" });

      assert.equal(logCalls.length, 1);
      const infoJson = JSON.parse(logCalls[0] ?? "{}");
      assert.equal(infoJson.level, "INFO");
      assert.equal(infoJson.message, "Order created");
      assert.deepEqual(infoJson.context, { orderId: 123 });

      assert.equal(warnCalls.length, 1);
      assert.equal(JSON.parse(warnCalls[0] ?? "{}").level, "WARN");

      assert.equal(errorCalls.length, 1);
      assert.equal(JSON.parse(errorCalls[0] ?? "{}").level, "ERROR");
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      process.env.NODE_ENV = originalEnv;
    }
  });
});
