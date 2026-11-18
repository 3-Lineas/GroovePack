# Project Context & Architecture: @3lineas/groovepack

This file provides AI agents with instant architectural orientation for this project.

## 1. Overview & Vision
`@3lineas/groovepack` (`v1.0.0`) is an installable, zero-dependency, tree-shakeable NPM package providing universal TypeScript utilities for Node.js, Cloudflare Workers (`workerd`), React/Vite, Next.js, and Astro applications.

## 2. Stack & Dependencies
- **Package Manager**: `pnpm`
- **Build & Transpilation**: `tsup` (ESM + `.d.ts` bundles), `tsx` (`node:test` runner), `typescript` (ES2022 / ESNext modules, strict mode)
- **Optional Peer Dependencies**: `hono`, `@base-ui/react` (marked optional via `peerDependenciesMeta`)
- **Target Runtimes**: Node.js, Cloudflare Workers (`workerd`), Browsers (Vite / React), Next.js, Astro

## 3. Subpath Exports & Directory Structure
All modules are exposed via `package.json` Subpath Exports (`sideEffects: false`):
- `./logger` (`src/logger/index.ts`) — Universal structured logger (ANSI dev / JSON prod)
- `./pipeline` (`src/pipeline/index.ts`) — Laravel-inspired `Pipeline` orchestrator
- `./pipeline/with-d1-transaction` (`src/pipeline/with-d1-transaction.ts`) — Cloudflare D1 batch transaction helper
- `./api-client` (`src/api-client/index.ts`) — REST & Hono RPC client factory
- `./api-action` (`src/api-action/index.ts`) — Standardized `ActionResponse<T>` HTTP wrapper
- `./api-toast` (`src/api-toast/index.ts`) — Shadcn Toast wrapper for `ActionResponse<T>` (auto-resolves `${shadcnPath}/toast`)
- `./i18n` (`src/i18n/index.ts`) — 5-language (`en`, `es`, `pt`, `it`, `fr`) fallback message dictionary (100% env-driven via `GROOVEPACK_LOCALE` / `NEXT_PUBLIC_GROOVEPACK_LOCALE`)
- `./vite` (`src/vite/index.ts`) — Optional Vite plugin (`groovepack()`) to statically resolve `${shadcnPath}/toast`

### Conventions
- **Atomic Modules**: <200 lines per file, 1 function/type per file.
- **Type Isolation**: All non-UI types/interfaces live in `src/types/{domain}/{name}.type.ts`.
- **Zero `any` / Unsafe Casts**: Strict `unknown` narrowing, `satisfies`, `noUncheckedIndexedAccess`, `noImplicitOverride`.
- **No Barrel Files**: Direct imports only; `index.ts` files are strictly `tsup` bundle entry points.
- **English-Only Copy**: Default fallback messages (`"en"`), docs, and code comments are strictly in English, with `i18n` support for `en`, `es`, `pt`, `it`, `fr`.

## 4. Essential Commands
- **build**: `pnpm build`
- **typecheck**: `pnpm check-types`
- **test**: `pnpm test`
- **dev**: `pnpm dev`
