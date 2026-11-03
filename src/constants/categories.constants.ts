import type { LibraryCategory } from "../types/registry.types.js";

export interface CategoryMetadata {
  id: LibraryCategory;
  label: string;
  hint: string;
}

export const CATEGORIES: readonly CategoryMetadata[] = [
  {
    id: "common",
    label: "Common",
    hint: "Universal agnostic utilities (Logger, formatters, pure helpers)",
  },
  {
    id: "server",
    label: "Hono / Next Server",
    hint: "Backend adapters, API wrappers, RPC handlers & server errors",
  },
  {
    id: "react",
    label: "React",
    hint: "Client hooks, UI wrappers, notifications & island state",
  },
] as const;
