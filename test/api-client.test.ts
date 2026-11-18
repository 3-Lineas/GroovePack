import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Hono } from "hono";
import { createApiClient, createHonoClient } from "../src/api-client/index";

describe("createApiClient", () => {
  it("resolves URLs, injects Bearer token, and serializes BigInt", async () => {
    let capturedUrl = "";
    let capturedHeaders: Headers | undefined;
    let capturedBody: unknown;

    const mockFetch: typeof fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedHeaders = new Headers(init?.headers);
      capturedBody = init?.body;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };

    const api = createApiClient({
      baseUrl: "https://api.example.com/v1/",
      getToken: () => "secret-jwt",
      defaultHeaders: { "X-Custom": "123" },
      fetcher: mockFetch,
    });

    await api.post("/orders", { total: BigInt(1500) });

    assert.equal(capturedUrl, "https://api.example.com/v1/orders");
    assert.equal(capturedHeaders?.get("Authorization"), "Bearer secret-jwt");
    assert.equal(capturedHeaders?.get("X-Custom"), "123");
    assert.equal(capturedHeaders?.get("Content-Type"), "application/json");
    assert.equal(capturedBody, '{"total":"1500"}');
  });

  it("createHonoClient preserves Hono RPC type inference and injects auth headers", async () => {
    const app = new Hono().get("/ping", (c) => {
      const auth = c.req.header("Authorization");
      return c.json({ pong: true, auth });
    });

    type AppType = typeof app;

    const client = createHonoClient<AppType>({
      baseUrl: "https://rpc.example.com",
      getToken: () => "rpc-token",
      fetcher: async (input: RequestInfo | URL, init?: RequestInit) =>
        app.request(input, init),
    });

    const res = await client.ping.$get();
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.deepEqual(data, { pong: true, auth: "Bearer rpc-token" });
  });

  it("createHonoClient accepts Hono routers with custom Bindings and Variables without TS2344", async () => {
    const app = new Hono<{
      Bindings: { DB: string };
      Variables: { userId: string };
    }>()
      .use("*", async (c, next) => {
        c.set("userId", "user-42");
        await next();
      })
      .get("/me", (c) => {
        return c.json({ userId: c.get("userId") });
      });

    type AppType = typeof app;

    const client = createHonoClient<AppType>({
      baseUrl: "https://rpc.example.com",
      fetcher: async (input: RequestInfo | URL, init?: RequestInit) =>
        app.request(input, init, { DB: "mock-d1" }),
    });

    const res = await client.me.$get();
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.deepEqual(data, { userId: "user-42" });
  });
});
