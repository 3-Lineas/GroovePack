import { existsSync } from "node:fs";
import path from "node:path";
import type {
  GroovepackVitePlugin,
  GroovepackVitePluginOptions,
  GroovepackViteResolvedConfig,
} from "@/types/vite/vite-plugin.type";

const DEFAULT_SHADCN_UI_PATH = "/src/components/ui";
const VIRTUAL_MISSING_TOAST_ID = "\0groovepack-missing-toast";
const DYNAMIC_IMPORT_PATTERN =
  /import\(\s*\/\*\s*@vite-ignore\s*\*\/\s*[^)]+\)/g;
const TOAST_EXTENSIONS = [
  "",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  "/index.ts",
  "/index.tsx",
] as const;

function resolveShadcnPath(options?: GroovepackVitePluginOptions): string {
  const candidate =
    options?.shadcnPath ??
    process.env["GROOVEPACK_SHADCN_PATH"] ??
    process.env["NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH"] ??
    DEFAULT_SHADCN_UI_PATH;

  return candidate.trim().replace(/\/+$/, "") || DEFAULT_SHADCN_UI_PATH;
}

function hasToastModuleOnDisk(rootDir: string, shadcnPath: string): boolean {
  const relativeBase = shadcnPath.startsWith("/")
    ? shadcnPath.slice(1)
    : shadcnPath;
  const baseTarget = path.resolve(rootDir, relativeBase, "toast");

  return TOAST_EXTENSIONS.some((ext) => existsSync(`${baseTarget}${ext}`));
}

/**
 * Optional Vite plugin for `@3lineas/groovepack/api-toast`.
 * Statically resolves `${shadcnPath}/toast` in both `vite dev` and `vite build`.
 */
export function groovepack(
  options?: GroovepackVitePluginOptions,
): GroovepackVitePlugin {
  let rootDir = process.cwd();
  const shadcnPath = resolveShadcnPath(options);
  const toastImportTarget = `${shadcnPath}/toast`;

  return {
    name: "groovepack",
    enforce: "pre",
    config() {
      return {
        optimizeDeps: {
          exclude: ["@3lineas/groovepack"],
        },
      };
    },
    configResolved(resolvedConfig: GroovepackViteResolvedConfig) {
      if (resolvedConfig.root) {
        rootDir = resolvedConfig.root;
      }
    },
    resolveId(source: string) {
      if (source === VIRTUAL_MISSING_TOAST_ID) {
        return VIRTUAL_MISSING_TOAST_ID;
      }

      return undefined;
    },
    load(id: string) {
      if (id === VIRTUAL_MISSING_TOAST_ID) {
        return "export default undefined;";
      }

      return undefined;
    },
    transform(code: string, id: string) {
      if (!id.includes("groovepack") || !id.includes("api-toast")) {
        return undefined;
      }

      const target = hasToastModuleOnDisk(rootDir, shadcnPath)
        ? toastImportTarget
        : VIRTUAL_MISSING_TOAST_ID;

      const transformed = code.replace(
        DYNAMIC_IMPORT_PATTERN,
        `import(${JSON.stringify(target)})`,
      );

      if (transformed === code) {
        return undefined;
      }

      return {
        code: transformed,
        map: null,
      };
    },
  };
}
