import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Hono } from "hono";
import { createApiClient, createHonoClient } from "../src/api-client/index";
import { dispatchRequest } from "../src/api-client/dispatch-request";
import { resolveFallbackUrl } from "../src/api-client/resolve-fallback-url";
import { resolveServiceBinding } from "../src/api-client/resolve-service-binding";

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

  it("merges sync and async getHeaders after defaultHeaders while respecting per-call init.headers", async () => {
    let capturedHeaders: Headers | undefined;
    let callCount = 0;

    const api = createApiClient({
      baseUrl: "https://api.example.com",
      defaultHeaders: {
        "X-App": "web",
        "X-Role": "guest",
        "X-Request-Seq": "0",
      },
      getHeaders: async () => {
        callCount += 1;
        return {
          "X-Role": "admin",
          "X-Request-Seq": String(callCount),
          "x-user-id": "user-99",
        };
      },
      fetcher: async (_input, init) => {
        capturedHeaders = new Headers(init?.headers);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
    });

    await api.get("/profile", {
      headers: { "x-user-id": "override-user" },
    });

    assert.equal(capturedHeaders?.get("X-App"), "web");
    assert.equal(capturedHeaders?.get("X-Role"), "admin");
    assert.equal(capturedHeaders?.get("X-Request-Seq"), "1");
    assert.equal(capturedHeaders?.get("x-user-id"), "override-user");

    await api.get("/profile");
    assert.equal(capturedHeaders?.get("X-Request-Seq"), "2");
  });

  it("supports sync getHeaders in createHonoClient", async () => {
    const app = new Hono().get("/whoami", (c) =>
      c.json({
        userId: c.req.header("x-user-id"),
        role: c.req.header("x-user-role"),
      }),
    );

    type AppType = typeof app;

    const client = createHonoClient<AppType>({
      baseUrl: "http://api.local/api",
      getHeaders: () => ({
        "x-user-id": "u-123",
        "x-user-role": "owner",
      }),
      fetcher: async (input: RequestInfo | URL, init?: RequestInit) =>
        app.request(new URL(String(input)).pathname.replace(/^\/api/, ""), init),
    });

    const res = await client.whoami.$get();
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { userId: "u-123", role: "owner" });
  });

  it("resolveServiceBinding resolves env[serviceBinding].fetch preserving `this` context", async () => {
    let capturedThis: unknown;
    let capturedUrl = "";

    const bindingObject = {
      marker: "cf-binding",
      async fetch(input: RequestInfo | URL) {
        capturedThis = this;
        capturedUrl = String(input);
        return new Response("ok", { status: 200 });
      },
    };

    const resolved = await resolveServiceBinding("API", async () => ({
      env: { API: bindingObject },
    }));

    assert.ok(resolved);
    await resolved("http://api.local/api/health");
    assert.equal(capturedThis, bindingObject);
    assert.equal(capturedUrl, "http://api.local/api/health");
  });

  it("resolveServiceBinding returns undefined when cloudflare:workers is unavailable or binding is missing", async () => {
    const missingModule = await resolveServiceBinding("API", async () => {
      throw new Error("Cannot find module 'cloudflare:workers'");
    });
    assert.equal(missingModule, undefined);

    const missingBinding = await resolveServiceBinding("API", async () => ({
      env: {},
    }));
    assert.equal(missingBinding, undefined);

    const emptyName = await resolveServiceBinding("   ", async () => ({
      env: { API: { fetch } },
    }));
    assert.equal(emptyName, undefined);
  });

  it("resolveFallbackUrl rewrites pathname and search onto fallbackBaseUrl", () => {
    assert.equal(
      resolveFallbackUrl(
        "http://api.local/api/users?page=2&active=true",
        "http://127.0.0.1:8787/",
      ),
      "http://127.0.0.1:8787/api/users?page=2&active=true",
    );

    assert.equal(
      resolveFallbackUrl("/api/health", "http://127.0.0.1:8787"),
      "http://127.0.0.1:8787/api/health",
    );
  });

  it("dispatchRequest uses active serviceBinding and bypasses fallbackBaseUrl", async () => {
    let bindingCalledWith = "";
    let fetcherCalled = false;

    const res = await dispatchRequest(
      "http://api.local/api/orders",
      { method: "GET" },
      {
        serviceBinding: "API",
        fallbackBaseUrl: "http://127.0.0.1:8787",
        fetcher: async () => {
          fetcherCalled = true;
          return new Response("fallback", { status: 200 });
        },
      },
      async () => async (input) => {
        bindingCalledWith = String(input);
        return new Response("binding", { status: 200 });
      },
    );

    assert.equal(await res.text(), "binding");
    assert.equal(bindingCalledWith, "http://api.local/api/orders");
    assert.equal(fetcherCalled, false);
  });

  it("createHonoClient falls back to fallbackBaseUrl + pathname + search when serviceBinding is unavailable", async () => {
    let capturedUrl = "";

    const app = new Hono().get("/api/items", (c) =>
      c.json({ limit: c.req.query("limit") }),
    );
    type AppType = typeof app;

    const client = createHonoClient<AppType>({
      baseUrl: "http://api.local",
      serviceBinding: "API",
      fallbackBaseUrl: "http://127.0.0.1:8787",
      fetcher: async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedUrl = String(input);
        return app.request(input, init);
      },
    });

    const res = await client.api.items.$get({ query: { limit: "10" } });
    assert.equal(res.status, 200);
    assert.equal(capturedUrl, "http://127.0.0.1:8787/api/items?limit=10");
    assert.deepEqual(await res.json(), { limit: "10" });
  });
});
