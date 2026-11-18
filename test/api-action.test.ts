import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { apiAction } from "../src/api-action/index.js";
import { GROOVEPACK_MESSAGES } from "../src/i18n/index.js";

describe("apiAction", () => {
  afterEach(() => {
    delete process.env.GROOVEPACK_LOCALE;
    delete process.env.NEXT_PUBLIC_GROOVEPACK_LOCALE;
  });

  it("handles 2xx MinimalResponse with ActionResponse payload", async () => {
    const result = await apiAction<{ id: number }>({
      apiCall: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: 1 } }),
      }),
    });

    assert.equal(result.success, true);
    assert.deepEqual(result.data, { id: 1 });
  });

  it("handles non-2xx HTTP error with JSON message", async () => {
    const result = await apiAction({
      apiCall: async () => ({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid payload" }),
      }),
    });

    assert.equal(result.success, false);
    assert.equal(result.error, "Invalid payload");
  });

  it("uses English ('en') default fallback on non-JSON HTTP error", async () => {
    const result = await apiAction({
      apiCall: async () => ({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("invalid json");
        },
      }),
    });

    assert.equal(result.success, false);
    assert.equal(result.error, GROOVEPACK_MESSAGES.en.unexpectedError);
  });

  it("uses translated fallback when GROOVEPACK_LOCALE is set", async () => {
    process.env.GROOVEPACK_LOCALE = "es";
    const spanishResult = await apiAction({
      apiCall: async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    });
    assert.equal(spanishResult.error, GROOVEPACK_MESSAGES.es.unexpectedError);

    process.env.GROOVEPACK_LOCALE = "fr";
    const frenchResult = await apiAction({
      apiCall: async () => {
        throw new Error("Network failure");
      },
      onError: () => {},
    });
    assert.equal(frenchResult.error, GROOVEPACK_MESSAGES.fr.unexpectedError);
  });

  it("uses custom defaultErrorMessage over locale fallback", async () => {
    process.env.GROOVEPACK_LOCALE = "es";
    const result = await apiAction({
      defaultErrorMessage: "Custom error",
      apiCall: async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    });

    assert.equal(result.success, false);
    assert.equal(result.error, "Custom error");
  });
});
