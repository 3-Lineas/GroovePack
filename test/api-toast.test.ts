import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { apiToast, createApiToast } from "../src/api-toast/index.js";
import { GROOVEPACK_MESSAGES } from "../src/i18n/index.js";

const tempDirs: string[] = [];

function createMockShadcnToastDir(): {
  dir: string;
  eventsFile: string;
} {
  const dir = mkdtempSync(path.join(os.tmpdir(), "groovepack-toast-"));
  tempDirs.push(dir);
  const eventsFile = path.join(dir, "events.json");
  writeFileSync(eventsFile, "[]", "utf8");

  const toastModuleCode = `
import { readFileSync, writeFileSync } from "node:fs";
let counter = 0;
const eventsFile = ${JSON.stringify(eventsFile)};
function pushEvent(event) {
  const current = JSON.parse(readFileSync(eventsFile, "utf8"));
  current.push(event);
  writeFileSync(eventsFile, JSON.stringify(current), "utf8");
}
export const toastManager = {
  add(options) {
    counter += 1;
    const id = "toast-" + counter;
    pushEvent({ method: "add", id, payload: options });
    return id;
  },
  update(id, updates) {
    pushEvent({ method: "update", id, payload: updates });
  },
  close(id) {
    pushEvent({ method: "close", id });
  },
};
`;

  writeFileSync(path.join(dir, "toast.mjs"), toastModuleCode, "utf8");
  writeFileSync(path.join(dir, "toast.js"), toastModuleCode, "utf8");
  return { dir, eventsFile };
}

async function readEvents(eventsFile: string) {
  const { readFileSync } = await import("node:fs");
  return JSON.parse(readFileSync(eventsFile, "utf8")) as Array<{
    method: string;
    id: string;
    payload?: Record<string, unknown>;
  }>;
}

describe("apiToast & createApiToast", () => {
  afterEach(() => {
    delete process.env.GROOVEPACK_LOCALE;
    delete process.env.NEXT_PUBLIC_GROOVEPACK_LOCALE;
    delete process.env.GROOVEPACK_SHADCN_PATH;
    delete process.env.NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH;
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it("resolves toastManager automatically from GROOVEPACK_SHADCN_PATH and triggers onSuccess", async () => {
    const { dir, eventsFile } = createMockShadcnToastDir();
    process.env.GROOVEPACK_SHADCN_PATH = dir;

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

    const events = await readEvents(eventsFile);
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

  it("reads GROOVEPACK_LOCALE automatically for loading and error messages", async () => {
    const { dir, eventsFile } = createMockShadcnToastDir();
    process.env.GROOVEPACK_SHADCN_PATH = dir;
    process.env.GROOVEPACK_LOCALE = "es";

    const result = await apiToast({
      action: async () => ({ success: false }),
    });

    assert.equal(result.success, false);
    const events = await readEvents(eventsFile);
    assert.deepEqual(events, [
      {
        method: "add",
        id: "toast-1",
        payload: { title: GROOVEPACK_MESSAGES.es.loading, type: "loading" },
      },
      {
        method: "update",
        id: "toast-1",
        payload: {
          title: GROOVEPACK_MESSAGES.es.operationFailed,
          type: "error",
        },
      },
    ]);
  });

  it("createApiToast applies custom defaultErrorMessage", async () => {
    const { dir, eventsFile } = createMockShadcnToastDir();
    process.env.GROOVEPACK_SHADCN_PATH = dir;

    const customToast = createApiToast({
      defaultErrorMessage: "Custom fallback",
    });

    const result = await customToast({
      action: async () => ({ success: false }),
    });

    assert.equal(result.success, false);
    const events = await readEvents(eventsFile);
    assert.deepEqual(events[1], {
      method: "update",
      id: "toast-1",
      payload: { title: "Custom fallback", type: "error" },
    });
  });

  it("throws an explicit error when Shadcn Toast is missing or invalid", async () => {
    const emptyDir = mkdtempSync(path.join(os.tmpdir(), "groovepack-empty-"));
    tempDirs.push(emptyDir);
    process.env.GROOVEPACK_SHADCN_PATH = emptyDir;

    await assert.rejects(
      async () =>
        apiToast({
          action: async () => ({ success: true }),
        }),
      /Could not load a valid Shadcn toastManager/,
    );
  });
});
