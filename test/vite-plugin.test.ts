import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { groovepack } from "../src/vite/index.js";

const tempDirs: string[] = [];

describe("groovepack Vite plugin", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it("excludes @3lineas/groovepack from optimizeDeps", () => {
    const plugin = groovepack();
    const config = plugin.config?.();
    assert.deepEqual(config?.optimizeDeps?.exclude, ["@3lineas/groovepack"]);
  });

  it("transforms dynamic import to static ${shadcnPath}/toast when toast file exists", () => {
    const rootDir = mkdtempSync(path.join(os.tmpdir(), "groovepack-vite-"));
    tempDirs.push(rootDir);
    mkdirSync(path.join(rootDir, "src/components/ui"), { recursive: true });
    writeFileSync(
      path.join(rootDir, "src/components/ui/toast.tsx"),
      "export const toastManager = {};",
      "utf8",
    );

    const plugin = groovepack({ shadcnPath: "/src/components/ui" });
    plugin.configResolved?.({ root: rootDir });

    const sampleCode =
      'const mod = await import(/* @vite-ignore */ toastModulePath);';
    const transformed = plugin.transform?.(
      sampleCode,
      "/app/node_modules/@3lineas/groovepack/dist/api-toast/index.js",
    );

    assert.equal(
      transformed?.code,
      'const mod = await import("/src/components/ui/toast");',
    );
  });

  it("transforms dynamic import to virtual missing-toast module when toast file does not exist", () => {
    const rootDir = mkdtempSync(path.join(os.tmpdir(), "groovepack-vite-"));
    tempDirs.push(rootDir);

    const plugin = groovepack();
    plugin.configResolved?.({ root: rootDir });

    const sampleCode =
      'const mod = await import(/* @vite-ignore */ toastModulePath);';
    const transformed = plugin.transform?.(
      sampleCode,
      "/app/node_modules/@3lineas/groovepack/dist/api-toast/index.js",
    );

    assert.equal(
      transformed?.code,
      'const mod = await import("\\u0000groovepack-missing-toast");',
    );
    assert.equal(
      plugin.load?.("\0groovepack-missing-toast"),
      "export default undefined;",
    );
  });

  it("handles consecutive transform calls without stateful regex lastIndex bugs", () => {
    const plugin = groovepack();
    plugin.configResolved?.({ root: "/non-existent-groovepack-root" });

    const longCode = `${" ".repeat(120)}const a = import(/* @vite-ignore */ toastModulePath);`;
    const shortCode = "import(/* @vite-ignore */ toastModulePath);";

    const first = plugin.transform?.(
      longCode,
      "/app/node_modules/@3lineas/groovepack/dist/api-toast/index.js",
    );
    const second = plugin.transform?.(
      shortCode,
      "/app/node_modules/@3lineas/groovepack/dist/api-toast/index.js",
    );

    assert.ok(first?.code.includes("groovepack-missing-toast"));
    assert.ok(second?.code.includes("groovepack-missing-toast"));
  });
});
