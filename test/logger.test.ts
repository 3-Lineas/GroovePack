import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Logger } from "../src/logger/index";

describe("Logger", () => {
  it("logs formatted ANSI output in development/test mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "test";
    const originalLog = console.log;
    const calls: unknown[][] = [];
    console.log = (...args: unknown[]) => calls.push(args);

    try {
      const logger = new Logger("TestService");
      logger.info("User logged in", { file: "auth.ts", line: 10, userId: "u1" });
      assert.equal(calls.length, 1);
      assert.match(String(calls[0][0]), /\[INFO\] \[TestService\] \[auth\.ts:10\]:.*User logged in/);
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
      const logger = new Logger("ProdService");
      logger.info("Order created", { orderId: 123 });
      logger.warn("Low stock", { sku: "ABC" });
      logger.error("DB failure", { code: "E_DB" }, new Error("boom"));

      assert.equal(logCalls.length, 1);
      const infoJson = JSON.parse(logCalls[0]);
      assert.equal(infoJson.level, "info");
      assert.equal(infoJson.serviceName, "ProdService");
      assert.equal(infoJson.message, "Order created");
      assert.deepEqual(infoJson.context, { orderId: 123 });

      assert.equal(warnCalls.length, 1);
      assert.equal(JSON.parse(warnCalls[0]).level, "warn");

      assert.equal(errorCalls.length, 1);
      assert.equal(JSON.parse(errorCalls[0]).level, "error");
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      process.env.NODE_ENV = originalEnv;
    }
  });
});
