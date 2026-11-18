import type { Hono } from "hono";

/**
 * Constraint matching any `Hono<E, S, BasePath>` instance (including
 * routers with custom `Bindings` and `Variables`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyHonoApp = Hono<any, any, any>;
