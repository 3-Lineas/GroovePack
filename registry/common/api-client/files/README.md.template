# 🌐 Universal API Client (`src/lib/api-client`)

> **Universal REST HTTP client & Hono RPC factory with automatic Bearer token injection and BigInt-safe serialization.**

---

## 📖 How to Use

### A. REST Client

```typescript
import { createApiClient } from "@/lib/api-client";

export const api = createApiClient({
  baseUrl: "https://api.example.com",
  getToken: () => localStorage.getItem("auth_token"),
});

// GET request
const response = await api.get("/users/me");
const data = await response.json();

// POST request with automatic JSON serialization
const createRes = await api.post("/users", { name: "Alice", email: "alice@example.com" });
```

### B. Strongly-Typed Hono RPC Client

```typescript
import { createHonoClient } from "@/lib/api-client";
import type { AppType } from "api";

export const rpc = createHonoClient<AppType>({
  baseUrl: "http://localhost:8787",
  getToken: () => localStorage.getItem("auth_token"),
});

// Full end-to-end typed route autocomplete
const res = await rpc.v1.products.$get();
```

---

## 📥 Inputs & Outputs

### Configuration: `ApiClientConfig`
- **`baseUrl`** (`string`, optional): Base URL for API requests. Defaults to empty string in browser or `http://localhost:8787` in dev.
- **`getToken`** (`() => string | Promise<string>`, optional): Dynamic token resolver callback.
- **`headers`** (`Record<string, string>`, optional): Static or dynamic custom headers.
- **`fetch`** (`typeof fetch`, optional): Custom fetch implementation (e.g. for testing, SSR, or Cloudflare Service Bindings).

### Methods
- `api.get(path, init)` / `api.post(path, body, init)` / `api.put` / `api.patch` / `api.delete` / `api.fetch`
- Returns: `Promise<Response>` standard Fetch API response.

---

## ⚠️ Possible Errors & Troubleshooting

| Issue / Error | Cause | Solution |
| :--- | :--- | :--- |
| **`Authorization` header missing** | `getToken()` returned `null`/`undefined` or was omitted. | Ensure your authentication store sets the token or pass a custom `getToken` resolver in `ApiClientConfig`. |
| **`ReferenceError: window is not defined` (SSR / Edge)** | Accessing `getStoredToken()` in a server runtime. | Do not use browser `localStorage` in SSR. Pass tokens via cookies or HTTP headers. |
| **`Content-Type: application/json` overriding `FormData`** | Sending files or multipart data with manual JSON header. | `createApiClient` automatically skips JSON content-type if `body` is `FormData` or `URLSearchParams`. |
