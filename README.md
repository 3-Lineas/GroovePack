# `@3lineas/groovepack`

Zero-dependency & modular infrastructure primitives for **TypeScript**, **Cloudflare Workers (D1, Hono)**, **React**, and **Astro**.

`@3lineas/groovepack` provides standardized, production-tested building blocks for backend pipelines, atomic Cloudflare D1 transactions, structured logging, typed Hono RPC / REST clients, standardized `ActionResponse<T>` wrappers, and Shadcn v4 (`@base-ui/react/toast`) toast orchestration — exposed via **Subpath Exports** with `sideEffects: false` and **optional peer dependencies**.

---

## Table of Contents

- [Why Subpath Exports?](#why-subpath-exports)
- [Installation](#installation)
- [Available Modules](#available-modules)
- [1. `@3lineas/groovepack/logger`](#1-3lineasgroovepacklogger)
- [2. `@3lineas/groovepack/pipeline`](#2-3lineasgroovepackpipeline)
- [3. `@3lineas/groovepack/pipeline/with-d1-transaction`](#3-3lineasgroovepackpipelinewith-d1-transaction)
- [4. `@3lineas/groovepack/api-client`](#4-3lineasgroovepackapi-client)
- [5. `@3lineas/groovepack/api-action`](#5-3lineasgroovepackapi-action)
- [6. `@3lineas/groovepack/api-toast`](#6-3lineasgroovepackapi-toast)
- [7. `@3lineas/groovepack/errors`](#7-3lineasgroovepackerrors)
- [End-to-End Architecture Example](#end-to-end-architecture-example)
- [Migrating from v0.x (CLI Copy-Paste)](#migrating-from-v0x-cli-copy-paste)

---

## Why Subpath Exports?

- **Zero Dead Weight**: Backend workers importing `/logger` and `/pipeline` never bundle `@base-ui/react` or frontend code. Frontend apps importing `/api-toast` never bundle server utilities.
- **No Barrel Files**: Every module has its own dedicated entry point for optimal tree-shaking.
- **Immutable Infrastructure**: Lives in `node_modules` with SemVer guarantees, preventing accidental local drift across monorepo apps.

---

## Installation

```bash
pnpm add @3lineas/groovepack
```

### Optional Peer Dependencies

Install only what your app actually uses:

| Subpath | Required Peer Dependency | Target Environment |
| :--- | :--- | :--- |
| `/logger` | *None (0 deps)* | Node, Cloudflare Workers, Browser |
| `/errors` | *None (0 deps)* | Node, Cloudflare Workers, Browser |
| `/pipeline` | *None (0 deps)* | Cloudflare Workers, Node |
| `/pipeline/with-d1-transaction` | *None (0 deps)* | Cloudflare Workers (D1 / Drizzle) |
| `/api-action` | *None (0 deps)* | React, Astro, Next.js, Node |
| `/api-client` | `hono >= 4.0.0` *(only if using `createHonoClient`)* | Frontend / Edge |
| `/api-toast` | `@base-ui/react >= 1.0.0` (Shadcn v4 `toast`) | React / Browser |
| `/vite` | *None (0 deps)* | Vite `vite.config.ts` |

---

## Available Modules

1. `@3lineas/groovepack/logger` — Structured Logger (ANSI in dev, JSON in prod).
2. `@3lineas/groovepack/pipeline` — Laravel-inspired sequential `Pipeline` with D1 batching.
3. `@3lineas/groovepack/pipeline/with-d1-transaction` — Standalone `withD1Transaction` wrapper.
4. `@3lineas/groovepack/api-client` — `createApiClient` (REST) & `createHonoClient` (Hono RPC).
5. `@3lineas/groovepack/api-action` — Polymorphic `apiAction` wrapper returning `ActionResponse<T>`.
6. `@3lineas/groovepack/api-toast` — `apiToast` and `createApiToast` for Shadcn v4 (`@base-ui/react/toast`).
7. `@3lineas/groovepack/errors` — `AppError` & `createAppError` for agnostic domain custom exceptions.

---

## 1. `@3lineas/groovepack/logger`

Universal structured logger that automatically adapts to the runtime:
- **Development / Test** (`NODE_ENV === "development"` or `"test"`): Outputs readable, ANSI-colored console logs.
- **Production / Cloudflare Workers**: Outputs single-line structured JSON for log indexing.

```typescript
import { Logger, type LogContext } from "@3lineas/groovepack/logger";

const logger = new Logger("API:Sales");

logger.debug("Validating cart items", { itemCount: 3 });
logger.info("Sale completed", { saleId: "sal_123", totalCents: 4500 });
logger.warn("Low inventory", { productId: "prod_9", remaining: 2 });

try {
  await processPayment();
} catch (error) {
  logger.error("Payment gateway timeout", { file: "checkout.ts", line: 42 }, error);
}
```

---

## 2. `@3lineas/groovepack/pipeline`

Sequential multi-action processor inspired by Laravel's `Pipeline`.
Each step is an isolated atomic function `(context: TContext) => Promise<TContext> | TContext`.

### Basic Usage

```typescript
import { Pipeline, type PipeAction } from "@3lineas/groovepack/pipeline";

interface OrderContext {
  items: Array<{ id: string; price: number }>;
  total: number;
}

const calculateTotal: PipeAction<OrderContext> = (ctx) => ({
  ...ctx,
  total: ctx.items.reduce((acc, item) => acc + item.price, 0),
});

const result = await Pipeline.send<OrderContext>({ items: [{ id: "1", price: 500 }], total: 0 })
  .through([calculateTotal])
  .thenReturn();
```

### Transactional Mode with Cloudflare D1 / Drizzle ORM

Calling `.transactional(db)` injects `tx: D1TransactionContext` into `context.tx`.
- Mutations staged via `context.tx.stage(...)` are held in memory.
- When `.thenReturn()` or `.then()` finishes, all staged statements are committed atomically via `db.batch()`.
- **Preventive In-Memory Rollback**: If any pipe throws an error, `db.batch()` is **never called** — zero mutations reach D1.

```typescript
import { Pipeline, type D1TransactionContext, type PipeAction } from "@3lineas/groovepack/pipeline";

interface CreateSaleContext {
  input: { productId: string; quantity: number };
  tx?: D1TransactionContext<D1Database, D1PreparedStatement>;
}

const validateStock: PipeAction<CreateSaleContext> = async (ctx) => {
  const row = await ctx.tx!.db
    .prepare("SELECT stock FROM products WHERE id = ?")
    .bind(ctx.input.productId)
    .first<{ stock: number }>();

  if (!row || row.stock < ctx.input.quantity) {
    throw new Error("Insufficient stock");
  }
  return ctx;
};

const stageSale: PipeAction<CreateSaleContext> = (ctx) => {
  ctx.tx!.stage(
    ctx.tx!.db
      .prepare("UPDATE products SET stock = stock - ? WHERE id = ?")
      .bind(ctx.input.quantity, ctx.input.productId),
    ctx.tx!.db
      .prepare("INSERT INTO sales (product_id, quantity) VALUES (?, ?)")
      .bind(ctx.input.productId, ctx.input.quantity),
  );
  return ctx;
};

await Pipeline.send<CreateSaleContext>({ input: { productId: "p1", quantity: 2 } })
  .transactional(env.DB)
  .through([validateStock, stageSale])
  .thenReturn();
```

---

## 3. `@3lineas/groovepack/pipeline/with-d1-transaction`

Standalone transactional helper for workflows that don't need the full `Pipeline` class:

```typescript
import { withD1Transaction } from "@3lineas/groovepack/pipeline/with-d1-transaction";

const saleId = await withD1Transaction(env.DB, async (tx) => {
  const user = await tx.db.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
  if (!user) throw new Error("User not found");

  tx.stage(
    tx.db.prepare("INSERT INTO sales (id, user_id) VALUES (?, ?)").bind("s_1", userId),
    tx.db.prepare("UPDATE users SET last_sale_at = ? WHERE id = ?").bind(Date.now(), userId),
  );

  return "s_1";
});
```

---

## 4. `@3lineas/groovepack/api-client`

Unified factory for both **REST** (`createApiClient`) and **Hono RPC** (`createHonoClient`), with automatic `Authorization: Bearer <token>` injection and `BigInt`-safe JSON serialization.

### Hono RPC Client

```typescript
import { createHonoClient } from "@3lineas/groovepack/api-client";
import type { AppType } from "api";

export const rpc = createHonoClient<AppType>({
  baseUrl: import.meta.env.VITE_API_URL,
  getToken: () => localStorage.getItem("auth_token"),
});

// Full end-to-end type inference
const res = await rpc.v1.products.$get();
```

### REST Client & Token Helpers

```typescript
import {
  createApiClient,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "@3lineas/groovepack/api-client";

export const api = createApiClient({
  baseUrl: "https://api.example.com/v1",
  tokenStorageKey: "auth_token",
  headers: { "X-App-Version": "1.0.0" },
});

const response = await api.post("/orders", { total: BigInt(1500) });
```

---

## 5. `@3lineas/groovepack/api-action`

Polymorphic wrapper that normalizes Hono RPC responses, standard `fetch` responses, `ActionResponse<T>`, or raw promises. Supports three TypeScript-overloaded modes while logging **exclusively on errors**:

1. **Default `ActionResponse<T>` mode** (mutations & `apiToast`):
```typescript
import { apiAction, type ActionResponse } from "@3lineas/groovepack/api-action";
import { rpc } from "@/lib/rpc";

export async function createProductAction(
  input: { name: string; price: number },
): Promise<ActionResponse<Product>> {
  return apiAction<Product>({
    defaultErrorMessage: "Could not create product. Please try again.",
    apiCall: () => rpc.v1.products.$post({ json: input }),
  });
}
```

2. **`fallback` mode** (Server Components / `page.tsx` returning `Promise<T>`):
```typescript
import { createAppError } from "@3lineas/groovepack/errors";

const listProductsError = createAppError({
  name: "ListProductsError",
  statusCode: 500,
  code: "PRODUCTS_LIST_FAILED",
  defaultMessage: "Could not load products.",
});

const products = await apiAction<Product[]>({
  apiCall: () => rpc.v1.products.$get(),
  fallback: [],
  onError: listProductsError,
});
```

3. **`throwOnError: true` mode** (Error Boundaries / `error.tsx` returning `Promise<T>` or throwing `Error`):
```typescript
const product = await apiAction<Product>({
  apiCall: () => rpc.v1.products[":id"].$get({ param: { id } }),
  throwOnError: true,
  defaultErrorMessage: "Product could not be loaded.",
});
```

---

## 6. `@3lineas/groovepack/api-toast`

Orchestrates async actions with **Shadcn Toast** loading, success, and error toasts, returning the resolved `ActionResponse<T>`. Automatically resolves `toastManager` from `/src/components/ui/toast` (or `GROOVEPACK_SHADCN_PATH` / `NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH`), and reads the active language strictly from `GROOVEPACK_LOCALE` / `NEXT_PUBLIC_GROOVEPACK_LOCALE` (defaulting to `"en"`).

```typescript
import { apiToast } from "@3lineas/groovepack/api-toast";

await apiToast({
  action: () => loginAction(values),
  onSuccess: () => {
    router.push("/dashboard");
    router.refresh();
  },
});
```

### Vite Plugin (`@3lineas/groovepack/vite`)

For Vite apps, register `groovepack()` in `vite.config.ts` so `${shadcnPath}/toast` is statically resolved in both `vite dev` and `vite build`:

```typescript
import { defineConfig } from "vite";
import { groovepack } from "@3lineas/groovepack/vite";

export default defineConfig({
  plugins: [groovepack()],
});
```

```typescript
// Or passing the toast manager directly per call
await apiToast({
  toast: toastManager,
  action: () => deleteProductAction(id),
  loadingMessage: "Eliminando...",
});
```

---

## 7. `@3lineas/groovepack/errors`

Framework-agnostic custom exception primitives (`createAppError` and `AppError`) for **backend APIs, domain/pipeline actions, queues, and frontend Server Actions**. Every custom exception extends `AppError`, carries explicit `statusCode` and `code` metadata, and automatically logs via `@3lineas/groovepack/logger` unless `silent: true`.

### A. Defining Domain Custom Exceptions (`createAppError`)

Define each domain error as an atomic callable factory (`1` export per file):

```typescript
// src/errors/stores/slug-conflict.error.ts
import { createAppError } from "@3lineas/groovepack/errors";

export const slugConflictError = createAppError({
  name: "SlugConflictError",
  statusCode: 409,
  code: "SLUG_ALREADY_IN_USE",
  defaultMessage: "This URL slug is already taken. Please choose another one.",
  silent: true, // Expected business conflict: suppress error log noise
});
```

```typescript
// src/errors/users/list-users.error.ts
import { createAppError } from "@3lineas/groovepack/errors";

export const listUsersError = createAppError({
  name: "ListUsersError",
  statusCode: 500,
  code: "USERS_LIST_FAILED",
  defaultMessage: "Could not load users right now.",
});
```

### B. Throwing in Domain Logic, Pipelines & Backend Actions

```typescript
import { slugConflictError } from "@/errors/stores/slug-conflict.error";

// Uses defaultMessage:
if (existingStore) {
  throw slugConflictError(undefined, { slug });
}

// Or overrides the message dynamically:
throw slugConflictError(`The slug "${slug}" is already registered.`, { slug });
```

### C. Catching, Type-Guarding & Global Error Handlers

```typescript
import { AppError } from "@3lineas/groovepack/errors";
import { slugConflictError } from "@/errors/stores/slug-conflict.error";

try {
  await createStore(input);
} catch (caughtError) {
  // Match a specific custom exception:
  if (slugConflictError.is(caughtError)) {
    return { status: caughtError.statusCode, code: caughtError.code };
  }

  // Or handle any AppError uniformly (e.g., Hono globalErrorHandler):
  if (caughtError instanceof AppError) {
    return ctx.json(
      { success: false, error: caughtError.message, code: caughtError.code },
      caughtError.statusCode,
    );
  }

  throw caughtError;
}
```

### D. Class Inheritance (`extends AppError`)

When you need custom class hierarchy or extra properties, extend `AppError` directly:

```typescript
import { AppError } from "@3lineas/groovepack/errors";

export class PaymentGatewayError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super({
      message,
      statusCode: 502,
      code: "PAYMENT_GATEWAY_ERROR",
      details,
      cause,
    });
  }
}
```

### E. Direct Integration with `apiAction`

Because `createAppError` factories share the `(message?, details?)` signature, pass them directly to `onError` without wrappers across all three `apiAction` modes (`ActionResponse<T>`, `fallback`, and `throwOnError: true`):

```typescript
const users = await apiAction<User[]>({
  apiCall: () => rpc.v1.users.$get(),
  fallback: [],
  onError: listUsersError,
});
```

---

## End-to-End Architecture Example

```text
[React Form]
  └─> apiToast({ action: () => createSaleAction(data) })        (@3lineas/groovepack/api-toast)
        └─> apiAction({ apiCall: () => rpc.v1.sales.$post() })  (@3lineas/groovepack/api-action)
              └─> createHonoClient<AppType>()                   (@3lineas/groovepack/api-client)
                    └─> [Hono API Worker]
                          └─> Pipeline.send(ctx).transactional(db).through([...]) (@3lineas/groovepack/pipeline)
```

---

## Migrating from v0.x (CLI Copy-Paste)

1. Install the package:
   ```bash
   pnpm add @3lineas/groovepack
   ```
2. Replace local `@/lib/*` imports with package subpath imports:
   - `@/lib/logger` $\rightarrow$ `@3lineas/groovepack/logger`
   - `@/lib/pipeline/pipeline` $\rightarrow$ `@3lineas/groovepack/pipeline`
   - `@/lib/pipeline/with-d1-transaction` $\rightarrow$ `@3lineas/groovepack/pipeline/with-d1-transaction`
   - `@/lib/api-client` $\rightarrow$ `@3lineas/groovepack/api-client`
   - `@/lib/api-action` $\rightarrow$ `@3lineas/groovepack/api-action`
   - `@/lib/api-toast` $\rightarrow$ `@3lineas/groovepack/api-toast`
3. Remove the copied files from `src/lib/` once imports are updated.

---

## Internationalization (`@3lineas/groovepack/i18n`)

`apiAction` and `apiToast` ship with a zero-dependency **5-language dictionary** (`en`, `es`, `pt`, `it`, `fr`) defaulting to **English (`"en"`)**.

### Resolution Precedence (Highest to Lowest)
1. Explicit message string passed to the call or factory (`defaultErrorMessage`, `loadingMessage`, `successMessage`, `errorMessage`).
2. Explicit `locale` option (`apiAction({ locale: "es", ... })`, `apiToast({ locale: "pt", ... })`, `createApiToast({ locale: "fr" })`).
3. Runtime locale configured via `setGroovepackLocale("es")` from `@3lineas/groovepack/i18n`.
4. Environment variable (`GROOVEPACK_LOCALE` or `NEXT_PUBLIC_GROOVEPACK_LOCALE` in Vinext).
5. Default fallback: `"en"`.

```ts
import { setGroovepackLocale } from "@3lineas/groovepack/i18n";

setGroovepackLocale("es");
```
