import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { apiToast, createApiToast } from "../src/api-toast/index.js";
import { setGroovepackLocale } from "../src/i18n/index.js";

describe("apiToast & createApiToast", () => {
  afterEach(() => {
    setGroovepackLocale(undefined);
    delete process.env.GROOVEPACK_LOCALE;
  });

  it("resolves with ActionResponse on success and triggers onSuccess", async () => {
    let onSuccessCalled = false;

    const result = await apiToast<{ id: string }>({
      action: async () => ({ success: true, data: { id: "123" } }),
      successMessage: "Saved 123",
      onSuccess: (data) => {
        onSuccessCalled = data?.id === "123";
      },
    });

    assert.equal(result.success, true);
    assert.equal(onSuccessCalled, true);
  });

  it("returns failed ActionResponse and triggers onError when action returns success: false", async () => {
    let capturedError = "";

    const result = await apiToast({
      action: async () => ({ success: false, error: "Denied" }),
      onError: (errorMessage) => {
        capturedError = errorMessage;
      },
    });

    assert.equal(result.success, false);
    assert.equal(capturedError, "Denied");
  });

  it("createApiToast applies custom defaultErrorMessage and locale", async () => {
    const customToast = createApiToast({
      locale: "pt",
      defaultErrorMessage: "Custom fallback",
    });

    const result = await customToast({
      action: async () => ({ success: false }),
    });

    assert.equal(result.success, false);
  });

  it("catches thrown exceptions and returns standardized failure ActionResponse", async () => {
    const result = await apiToast({
      locale: "it",
      action: async () => {
        throw new Error("Boom");
      },
    });

    assert.equal(result.success, false);
    assert.equal(result.error, "Boom");
  });
});
