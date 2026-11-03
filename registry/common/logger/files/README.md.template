# 🪵 Structured Logger (`src/lib/logger`)

> **Universal, zero-dependency structured logger for Node.js, Cloudflare Workers, Next.js, and Browsers.**
> Human-readable ANSI color-coded formatting in development; structured JSON in production and edge runtimes.

---

## 📖 How to Use

```typescript
import { Logger } from "@/lib/logger";

// 1. Create a logger instance for your service or domain
const logger = new Logger("AuthService");

// 2. Log informational events with metadata
logger.info("User registered successfully", {
  file: "auth.service.ts",
  line: 42,
  userId: "usr_123",
});

// 3. Log warnings for non-fatal business flow anomalies
logger.warn("Rate limit threshold reached", { ip: "192.168.1.1" });

// 4. Log critical errors with caught exceptions
try {
  await db.insert(user);
} catch (error) {
  logger.error("Failed to persist user", { file: "auth.service.ts", line: 55 }, error);
}
```

---

## 📥 Inputs & Outputs

### Constructor: `new Logger(serviceName: string)`
- **`serviceName`**: Identifies the module or domain in log outputs (e.g. `"API:Auth"`, `"POS:Checkout"`).

### Methods: `logger.debug`, `logger.info`, `logger.warn`, `logger.error`
- **`message`** (`string`): Main description of the event.
- **`context`** (`LogContext`, optional): Key-value metadata object (e.g. `{ file, line, customerId }`).
- **`...args`** (`unknown[]`, optional): Extra parameters, raw objects, or caught `Error` instances.
- **Return Value**: `void`.

---

## ⚠️ Possible Errors & Troubleshooting

| Issue / Error | Cause | Solution |
| :--- | :--- | :--- |
| **`Cannot find name 'process'` (TS2580)** | Outdated logger templates referencing raw `process`. | GroovePack's logger uses safe `globalThis` detection; ensure your template is up-to-date. |
| **Logs printed as raw JSON during local development** | `NODE_ENV` is not set to `"development"` or `"test"`. | Ensure your dev script sets `NODE_ENV=development` or relies on default local runner flags. |
| **Circular reference in log context (`TypeError: Converting circular structure to JSON`)** | Passing a DOM node, active socket, or recursive object in `context` or `args`. | Pass plain serializable DTOs or extract specific properties before passing to the logger. |
