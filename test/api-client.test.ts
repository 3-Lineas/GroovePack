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
      headers: { "X-Custom": "123" },
      fetch: mockFetch,
    });

    await api.post("/orders", { total: BigInt(1500) });

    assert.equal(capturedUrl, "https://api.example.com/v1/orders");
    assert.equal(capturedHeaders?.get("Authorization"), "Bearer secret-jwt");
    assert.equal(capturedHeaders?.get("X-Custom"), "123");
    assert.equal(capturedHeaders?.get("Content-Type"), "application/json");
    assert.equal(capturedBody, '{"total":1500}');
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
      fetch: async (input, init) => app.request(input, init),
    });

    const res = await client.ping.$get();
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.deepEqual(data, { pong: true, auth: "Bearer rpc-token" });
  });
});
