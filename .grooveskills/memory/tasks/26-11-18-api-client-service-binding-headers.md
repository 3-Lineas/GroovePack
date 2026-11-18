---
status: completed
lane: task
date: 2026-11-18
---

# Task: `api-client` Dynamic Headers, Service Binding & `apiAction` Promise Support

## Outcome Hypothesis
Adding `getHeaders`, `serviceBinding`, and `fallbackBaseUrl` to `ApiClientConfig` (shared by `createApiClient` and `createHonoClient`) plus direct `Promise` support in `apiAction` eliminates repetitive SSR/Cloudflare Workers wrapper boilerplate while preserving browser/Node bundler compatibility.

## Checklist
- [x] Add `getHeaders`, `serviceBinding`, and `fallbackBaseUrl` to `src/types/api-client/api-client-config.type.ts` and isolate helper types.
- [x] Update `resolveHeaders` to merge `await getHeaders()` after `defaultHeaders` and before `init.headers`.
- [x] Implement `resolveServiceBinding`, `resolveFallbackUrl`, and `dispatchRequest` for bundler-safe `cloudflare:workers` resolution and local fallback.
- [x] Update `createApiClient` and `createHonoClient` to use `getHeaders` and `dispatchRequest`.
- [x] Support direct `Promise<ApiCallResult<T>>` inputs in `apiAction` (`ApiCallInput<T>`).
- [x] Add unit tests in `test/api-client.test.ts` and `test/api-action.test.ts`.
- [x] Update `README.md` Sections 4 and 5.
- [x] Verify with `pnpm run check-types`, `pnpm test`, and `pnpm run build`.

## Evidence
- `pnpm run check-types` (`tsc --noEmit`): passed with 0 errors.
- `pnpm test` (`tsx --test test/*.test.ts`): 60/60 tests passed across 15 suites.
- `pnpm run build` (`tsup`): ESM + `.d.ts` bundles built cleanly.
