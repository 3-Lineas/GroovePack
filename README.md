<div align="center">

# 📦 GroovePack (`@3lineas/groovepack`)

**A modern, zero-dependency source code registry CLI for high-performance TypeScript & React applications.**

Inspired by the `shadcn` philosophy: **don't install heavy, unmaintainable dependencies—copy battle-tested, strictly typed, adaptable source modules directly into your project.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![CLI](https://img.shields.io/badge/CLI-@clack%2Fprompts-cyan)](https://github.com/natemoo-re/clack)
[![Turborepo-free](https://img.shields.io/badge/Monorepo-Independent-green)](#)

</div>

---

## 🚀 Quick Start

Run the interactive CLI directly without installing anything globally:

```bash
npx @3lineas/groovepack
```

GroovePack will guide you through:
1. **Selecting a Domain Category** (`Common`, `React`, `Hono / Next Server`, or `Browse all`).
2. **Selecting Libraries** via an interactive multi-select prompt.
3. **Choosing the Destination Path** (defaults to `src/lib/<lib>`).
4. **Copying the Source Code** cleanly with transactional rollback guarantees.

---

## 💡 Why GroovePack?

Traditional npm packages often introduce:
- Dependency bloat and version conflicts across monorepos.
- Opaque abstractions that are difficult to customize for specific backend requirements.
- Overhead in CI/CD pipelines.

**GroovePack provides:**
- **Zero Package Bloat**: Code lives in your repo (`src/lib/...`). You own it, customize it, and debug it with standard breakpoints.
- **Enterprise-Grade Typing**: 100% strict TypeScript without `any` or loose casts.
- **Transactional Rollback (Zero-Crash Policy)**: If disk writing, permissions, or I/O encounters an issue, GroovePack restores prior files and cleans newly created folders automatically without terminating the process.
- **Universal Runtime Compatibility**: Node.js, Cloudflare Workers, Next.js (SSR / RSC), Astro Actions, and React Vite SPAs.

---

## 📚 Registry Catalog

### 1. `common`

#### 🪵 `logger`
Universal structured logger designed for seamless local development and production observability.
- **Local Development**: Human-readable ANSI color-coded terminal output with `[file:line]` context tracing.
- **Production / Cloudflare Workers**: Fast, structured JSON serialization compatible with log aggregators (Datadog, Cloudflare Logpush, Axiom).
- **Default Target**: `src/lib/logger`

```typescript
import { Logger } from "@/lib/logger";

const logger = new Logger("AuthService");

logger.info("User registered successfully", { userId: "usr_101" });
logger.warn("Rate limit approaching", { ip: "192.168.1.1" });
logger.error("Database connection failure", { pool: "primary" }, error);
```

#### 🌐 `api-client`
Hybrid universal HTTP client featuring REST convenience methods, dynamic authentication header injection, and optional Hono RPC integration.
- **REST Client**: Typed `get`, `post`, `put`, `patch`, `delete`, and `fetch` with BigInt-safe JSON serialization.
- **Authentication**: Dynamic bearer token resolver (browser `localStorage`, cookies, or custom async `getToken()` callback).
- **Hono RPC Factory**: Exported `createHonoClient<AppType>()` helper to instantiate `hc<AppType>` with shared base URL and auth headers.
- **Default Target**: `src/lib/api-client`

```typescript
import { createApiClient, createHonoClient } from "@/lib/api-client";
import type { AppType } from "api";

// 1. REST Client
export const api = createApiClient({
  baseUrl: "https://api.example.com",
  getToken: () => localStorage.getItem("token"),
});

const res = await api.get("/users/me");

// 2. Hono RPC Client (Optional)
export const rpc = createHonoClient<AppType>({
  baseUrl: "http://localhost:8787",
});
const productRes = await rpc.v1.products.$get();
```

---

### 2. `react`

#### ⚡ `api-action`
Universal async operation and API wrapper for React components, Server Actions, and custom hooks.
- **Polymorphic Compatibility**: Natively accepts Hono RPC responses, standard `fetch` (`Response`), structured `ActionResponse<T>`, or raw promises.
- **Strict Error-Only Logging**: Only logs on actual failures (`!response.ok`, `!result.success`, or unexpected runtime crashes). Does not pollute console logs on successful operations.
- **Default Target**: `src/lib/api-action`

```typescript
import { apiAction } from "@/lib/api-action";
import { api } from "@/lib/api-client";

export async function fetchCustomersAction() {
  return apiAction<Customer[]>({
    actionName: "fetchCustomers",
    apiCall: () => api.get("/customers"),
    onSuccess: (customers) => {
      console.log(`Loaded ${customers.length} customers`);
    },
  });
}
```

#### 🔔 `api-toast`
User feedback utility built on top of `sonner` (`toast.promise`).
- **Tri-State Feedback**: Automates `loading`, `success`, and `error` toasts for any `apiAction` or async procedure.
- **Typed Return**: Directly returns the underlying `Promise<ActionResponse<T>>` for component state inspection.
- **Full Backward Compatibility**: Exports both `apiToast` and `toasted` aliases.
- **Default Target**: `src/lib/api-toast`

```typescript
import { apiToast } from "@/lib/api-toast";
import { loginAction } from "@/actions/auth";

const handleSubmit = async (values: LoginFormValues) => {
  const result = await apiToast({
    action: () => loginAction(values),
    loadingMessage: "Authenticating credentials...",
    successMessage: (res) => `Welcome back, ${res.data?.name}!`,
    onSuccess: () => router.push("/dashboard"),
    onError: (err) => console.error("Login failed:", err),
  });

  if (result.success) {
    // Form submission complete
  }
};
```

---

### 3. `server`
Reserved domain for backend adapters, micro-middleware pipelines, and Cloudflare Worker / Next.js server helpers.

---

## 🛡️ Fault Tolerance & Atomic Rollbacks

When installing libraries, GroovePack uses an internal `RollbackManager` that:
1. Tracks all filesystem operations and directories created during the transaction.
2. Backs up pre-existing destination files in memory before applying changes.
3. If an error occurs (such as permission denials, path errors, or disk write failures):
   - Restores original file contents.
   - Removes newly written files.
   - Cleans up empty directory segments.
   - Reports the exact failure cause in the terminal **without crashing or interrupting the installation of other selected packages**.

---

## 🛠️ Local Development & Testing

```bash
# Clone the repository
git clone https://github.com/3-Lineas/GroovePack.git
cd GroovePack

# Install dependencies
pnpm install

# Type-check
pnpm run check-types

# Run test suite (Rollback & Installation)
pnpm test

# Build production CLI bundle
pnpm run build
```

---

## 📄 License

MIT © [3-Lineas](https://github.com/3-Lineas)
