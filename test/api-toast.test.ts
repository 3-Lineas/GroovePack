import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  apiToast,
  createApiToast,
  type BaseUiToastManager,
  type BaseUiToastPayload,
} from "../src/api-toast/index.js";
import { setGroovepackLocale } from "../src/i18n/index.js";

function createMockToastManager() {
  const events: Array<{
    method: "add" | "update" | "close";
    id: string;
    payload?: BaseUiToastPayload;
  }> = [];
  let counter = 0;

  const manager: BaseUiToastManager = {
    add(options) {
      counter += 1;
      const id = `toast-${counter}`;
      events.push({ method: "add", id, payload: options });
      return id;
    },
    update(id, updates) {
      events.push({ method: "update", id, payload: updates });
    },
    close(id) {
      events.push({ method: "close", id });
    },
  };

  return { manager, events };
}

describe("apiToast & createApiToast", () => {
  afterEach(() => {
    setGroovepackLocale(undefined);
    delete process.env.GROOVEPACK_LOCALE;
  });

  it("resolves with ActionResponse on success, calls .add()/.update(), and triggers onSuccess", async () => {
    let onSuccessCalled = false;
    const { manager, events } = createMockToastManager();

    const result = await apiToast<{ id: string }>({
      toast: manager,
      action: async () => ({ success: true, data: { id: "123" } }),
      successMessage: "Saved 123",
      onSuccess: (data) => {
        onSuccessCalled = data?.id === "123";
      },
    });

    assert.equal(result.success, true);
    assert.equal(onSuccessCalled, true);
    assert.deepEqual(events, [
      {
        method: "add",
        id: "toast-1",
        payload: { title: "Processing...", type: "loading" },
      },
      {
        method: "update",
        id: "toast-1",
        payload: { title: "Saved 123", type: "success" },
      },
    ]);
  });

  it("returns failed ActionResponse, updates toast with error, and triggers onError", async () => {
    let capturedError = "";
    const { manager, events } = createMockToastManager();

    const result = await apiToast({
      toast: manager,
      action: async () => ({ success: false, error: "Denied" }),
      onError: (errorMessage) => {
        capturedError = errorMessage;
      },
    });

    assert.equal(result.success, false);
    assert.equal(capturedError, "Denied");
    assert.deepEqual(events[1], {
      method: "update",
      id: "toast-1",
      payload: { title: "Denied", type: "error" },
    });
  });

  it("createApiToast applies custom defaultErrorMessage, locale, and default toast manager", async () => {
    const { manager, events } = createMockToastManager();
    const customToast = createApiToast({
      toast: manager,
      locale: "pt",
      defaultErrorMessage: "Custom fallback",
    });

    const result = await customToast({
      action: async () => ({ success: false }),
    });

    assert.equal(result.success, false);
    assert.deepEqual(events[1], {
      method: "update",
      id: "toast-1",
      payload: { title: "Custom fallback", type: "error" },
    });
  });

  it("catches thrown exceptions and returns standardized failure ActionResponse", async () => {
    const { manager, events } = createMockToastManager();

    const result = await apiToast({
      toast: manager,
      locale: "it",
      action: async () => {
        throw new Error("Boom");
      },
    });

    assert.equal(result.success, false);
    assert.equal(result.error, "Boom");
    assert.deepEqual(events[1], {
      method: "update",
      id: "toast-1",
      payload: { title: "Boom", type: "error" },
    });
  });

  it("throws an explicit error when Shadcn Toast (@base-ui/react/toast) is not installed or manager is invalid", async () => {
    await assert.rejects(
      async () =>
        apiToast({
          toast: null as unknown as BaseUiToastManager,
          action: async () => ({ success: true }),
        }),
      /Shadcn Toast \(@base-ui\/react\/toast\) is not installed or configured/,
    );

    await assert.rejects(
      async () =>
        apiToast({
          toast: {} as BaseUiToastManager,
          action: async () => ({ success: true }),
        }),
      /Shadcn Toast \(@base-ui\/react\/toast\) is not installed or configured/,
    );
  });
});
