# Project Context & Architecture: @3lineas/groovepack

This file provides AI agents with instant architectural orientation for this project.

## 1. Overview & Vision
`@3lineas/groovepack` is an interactive CLI for distributing zero-dependency, universal source-code modules (shadcn-style) for TypeScript, React, Cloudflare Workers, Next.js, and Node.js applications.

## 2. Stack & Dependencies
- **Package Manager**: `pnpm`
- **CLI Framework**: `@clack/prompts`, `picocolors`
- **Build & Transpilation**: `tsup`, `tsx`, `typescript` (ES2022 / ESNext modules)
- **Target Runtimes for Registry Templates**: Node.js, Cloudflare Workers (`workerd`), Browsers (Vite / React), Next.js, Astro

## 3. Directory Structure Conventions
- **Single Responsibility Principle**: <200 lines per file.
- **No Barrel Files**: Direct imports only; avoid re-exporting modules through `index.ts`.
- **Registry Structure**:
  - `registry/<category>/<module>/files/*.template`: Raw source code templates.
  - Templates must be **strictly self-contained and universally typed** without assuming consumer dependencies like `@types/node` or DOM globals.
- **Source Modules**:
  - `src/cli/`: Interactive wizard and prompt handling.
  - `src/constants/`: Category mappings and constant strings.
  - `src/installer/`: File copier and transactional rollback manager.
  - `src/registry/`: In-memory metadata catalog for available libraries.
  - `src/types/`: Strict TypeScript contracts and DTOs.

## 4. Architectural Rules & Invariants
- **Zero-Dependency Registry Rule**: Templates distributed via `registry/` must compile cleanly in minimal host projects without requiring undeclared globals (`process`, `Buffer`, `window`, etc.).
- **Transactional Rollback**: File installations must clean up created files/directories on any write failure without process crashes.
- **English-Only Copy**: All CLI prompts, error messages, docs, and code comments are strictly written in English.

## 5. Essential Commands
- **build**: `pnpm build`
- **typecheck**: `pnpm check-types`
- **test**: `pnpm test`
- **dev**: `pnpm dev`
