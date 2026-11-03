import type { RegistryItem, LibraryCategory } from "../types/registry.types.js";

export const REGISTRY_ITEMS: readonly RegistryItem[] = [
  {
    id: "logger",
    name: "Logger",
    description: "Universal structured logger: ANSI colors in dev, JSON for Cloudflare Workers & Serverless",
    category: "common",
    templateRelativeDir: "common/logger",
    defaultTarget: "src/lib/logger",
    files: [
      {
        sourcePath: "files/index.ts.template",
        targetRelPath: "index.ts",
      },
    ],
  },
  {
    id: "api-client",
    name: "API Client (REST & Hono RPC)",
    description: "Universal HTTP client: REST methods + optional Hono RPC factory with auth token injection",
    category: "common",
    templateRelativeDir: "common/api-client",
    defaultTarget: "src/lib/api-client",
    files: [
      {
        sourcePath: "files/index.ts.template",
        targetRelPath: "index.ts",
      },
    ],
  },
  {
    id: "api-action",
    name: "API Action Wrapper",
    description: "Universal React action wrapper with optional Hono RPC support and error-only logging",
    category: "react",
    templateRelativeDir: "react/api-action",
    defaultTarget: "src/lib/api-action",
    files: [
      {
        sourcePath: "files/index.ts.template",
        targetRelPath: "index.ts",
      },
    ],
  },
  {
    id: "api-toast",
    name: "API Toast (Sonner)",
    description: "Feedback helper (apiToast / toasted) for loading, success & error states with Sonner",
    category: "react",
    templateRelativeDir: "react/api-toast",
    defaultTarget: "src/lib/api-toast",
    files: [
      {
        sourcePath: "files/index.ts.template",
        targetRelPath: "index.ts",
      },
    ],
  },
] as const;

export function getLibrariesByCategory(category: LibraryCategory): RegistryItem[] {
  return REGISTRY_ITEMS.filter((item) => item.category === category);
}

export function getLibraryById(id: string): RegistryItem | undefined {
  return REGISTRY_ITEMS.find((item) => item.id === id);
}
