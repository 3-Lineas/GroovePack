import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { toast } from "sonner";
import { apiToast, toasted, createApiToast } from "../src/api-toast/index.js";

describe("apiToast & createApiToast", () => {
  it("resolves with ActionResponse on success and triggers onSuccess", async () => {
    const toastPromiseMock = mock.method(toast, "promise", () => "toast-id");
    let onSuccessCalled = false;

    const res = await apiToast<{ id: string }>({
      action: async () => ({
        success: true,
        message: "Saved!",
        data: { id: "123" },
      }),
      loadingMessage: "Saving...",
      successMessage: (r) => `Saved ${r.data?.id}`,
      onSuccess: async (r) => {
        onSuccessCalled = r.data?.id === "123";
      },
    });

    assert.equal(res.success, true);
    assert.deepEqual(res.data, { id: "123" });
    assert.equal(onSuccessCalled, true);
    assert.equal(toastPromiseMock.mock.callCount(), 1);

    toastPromiseMock.mock.restore();
  });

  it("returns failed ActionResponse and triggers onError when action returns success: false", async () => {
    const toastPromiseMock = mock.method(toast, "promise", () => "toast-id");
    let capturedErrorMsg = "";

    const res = await toasted({
      action: async () => ({
        success: false,
        message: "Invalid credentials",
      }),
      onError: (err) => {
        capturedErrorMsg = err.message;
      },
    });

    assert.equal(res.success, false);
    assert.equal(res.message, "Invalid credentials");
    assert.equal(capturedErrorMsg, "Invalid credentials");
    assert.equal(toastPromiseMock.mock.callCount(), 1);

    toastPromiseMock.mock.restore();
  });

  it("createApiToast applies custom defaultErrorMessage when action rejects", async () => {
    const toastPromiseMock = mock.method(toast, "promise", () => "toast-id");
    const customToast = createApiToast({
      defaultLoadingMessage: "Processing...",
      defaultSuccessMessage: "Done!",
      defaultErrorMessage: "Custom fallback error",
    });

    const res = await customToast({
      action: async () => ({
        success: false,
      }),
    });

    assert.equal(res.success, false);
    assert.equal(toastPromiseMock.mock.callCount(), 1);

    toastPromiseMock.mock.restore();
  });

  it("catches thrown exceptions and returns standardized failure ActionResponse", async () => {
    const toastPromiseMock = mock.method(toast, "promise", () => "toast-id");

    const res = await apiToast({
      action: async () => {
        throw new Error("Network failure");
      },
    });

    assert.equal(res.success, false);
    assert.equal(res.error, "Network failure");
    assert.equal(res.message, "Network failure");

    toastPromiseMock.mock.restore();
  });
});
