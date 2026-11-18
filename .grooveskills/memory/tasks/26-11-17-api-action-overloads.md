---
status: completed
lane: task
date: 2026-11-17
---

# Task: `apiAction` Overloads (`fallback` & `throwOnError`)

## Outcome Hypothesis
Extending `apiAction<T>(options)` with `fallback` and `throwOnError: true` TypeScript overloads allows Server Components and Error-Boundary-backed loaders to unwrap `ActionResponse<T>` directly into `Promise<T>` without boilerplate, while keeping default `ActionResponse<T>` mode 100% backwards-compatible and logging errors at most once.

## Checklist
- [x] Create isolated types in `src/types/api-action/` (`ApiActionBaseOptions`, `ApiActionWithFallbackOptions`, `ApiActionThrowOptions`, `UnwrapStrategy`) and update `ApiActionOptions`.
- [x] Extract `executeApiCall` and `unwrapActionResponse` into atomic helpers in `src/api-action/`.
- [x] Add TypeScript overloads and single-log `onError` tracking to `src/api-action/index.ts`.
- [x] Add unit tests and `@ts-expect-error` compile-time assertions in `test/api-action.test.ts`.
- [x] Update Section 5 of `README.md`.
- [x] Verify with `pnpm run check-types`, `pnpm test`, and `pnpm run build`.

## Evidence
- `pnpm run check-types` (`tsc --noEmit`): passed with 0 errors (including `NoInfer<T>` inference and `@ts-expect-error` mutual exclusion checks).
- `pnpm test` (`tsx --test test/*.test.ts`): 38/38 tests passed across 10 suites.
- `pnpm run build` (`tsup`): ESM + `.d.ts` bundles built cleanly.
