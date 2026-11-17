import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiAction, type ErrorLogger } from "../src/api-action/index";

const silentLogger: ErrorLogger = {
  error: () => {},
};

describe("apiAction", () => {
  it("handles 2xx MinimalResponse with ActionResponse payload", async () => {
    let successPayload: unknown = null;

    const res = await apiAction<{ id: number }>({
      actionName: "getItem",
      logger: silentLogger,
      apiCall: async () => ({
        ok: true,
        status: 200,
        text: async () => "",
        json: async () => ({ success: true, message: "OK", data: { id: 42 } }),
      }),
      onSuccess: (data) => {
        successPayload = data;
      },
    });

    assert.equal(res.success, true);
    assert.deepEqual(res.data, { id: 42 });
    assert.deepEqual(successPayload, { id: 42 });
  });

  it("handles non-2xx HTTP error with JSON message", async () => {
    const res = await apiAction({
      actionName: "createItem",
      logger: silentLogger,
      apiCall: async () => ({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: "Invalid input", error: "VALIDATION" }),
        json: async () => ({}),
      }),
    });

    assert.equal(res.success, false);
    assert.equal(res.message, "Invalid input");
    assert.equal(res.error, "VALIDATION");
  });

  it("uses custom defaultErrorMessage on non-JSON HTTP error", async () => {
    const res = await apiAction({
      actionName: "failPlain",
      logger: silentLogger,
      defaultErrorMessage: "Custom fallback error",
      apiCall: async () => ({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
        json: async () => ({}),
      }),
    });

    assert.equal(res.success, false);
    assert.equal(res.message, "Custom fallback error");
  });

  it("catches unexpected exceptions gracefully", async () => {
    const res = await apiAction({
      actionName: "crash",
      logger: silentLogger,
      apiCall: async () => {
        throw new Error("Network down");
      },
    });

    assert.equal(res.success, false);
    assert.equal(res.error, "Network down");
  });
});
