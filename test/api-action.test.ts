import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { apiAction, type ActionResponse } from "../src/api-action/index.js";
import { GROOVEPACK_MESSAGES } from "../src/i18n/index.js";

interface UserItem {
  id: number;
  name: string;
}

describe("apiAction", () => {
  afterEach(() => {
    delete process.env.GROOVEPACK_LOCALE;
    delete process.env.NEXT_PUBLIC_GROOVEPACK_LOCALE;
  });

  it("handles 2xx MinimalResponse with ActionResponse payload", async () => {
    const result = await apiAction<{ id: number }>({
      apiCall: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: 1 } }),
      }),
    });

    assert.equal(result.success, true);
    assert.deepEqual(result.data, { id: 1 });
  });

  it("handles non-2xx HTTP error with JSON message", async () => {
    const result = await apiAction({
      apiCall: async () => ({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid payload" }),
      }),
    });

    assert.equal(result.success, false);
    assert.equal(result.error, "Invalid payload");
  });

  it("uses English ('en') default fallback on non-JSON HTTP error", async () => {
    const result = await apiAction({
      apiCall: async () => ({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("invalid json");
        },
      }),
    });

    assert.equal(result.success, false);
    assert.equal(result.error, GROOVEPACK_MESSAGES.en.unexpectedError);
  });

  it("uses translated fallback when GROOVEPACK_LOCALE is set", async () => {
    process.env.GROOVEPACK_LOCALE = "es";
    const spanishResult = await apiAction({
      apiCall: async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    });
    assert.equal(spanishResult.error, GROOVEPACK_MESSAGES.es.unexpectedError);

    process.env.GROOVEPACK_LOCALE = "fr";
    const frenchResult = await apiAction({
      apiCall: async () => {
        throw new Error("Network failure");
      },
      onError: () => {},
    });
    assert.equal(frenchResult.error, GROOVEPACK_MESSAGES.fr.unexpectedError);
  });

  it("uses custom defaultErrorMessage over locale fallback", async () => {
    process.env.GROOVEPACK_LOCALE = "es";
    const result = await apiAction({
      defaultErrorMessage: "Custom error",
      apiCall: async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    });

    assert.equal(result.success, false);
    assert.equal(result.error, "Custom error");
  });

  describe("fallback mode", () => {
    it("returns unwrapped data on success without invoking onError", async () => {
      let errorCalls = 0;
      const users = await apiAction<UserItem[]>({
        apiCall: async () => ({
          success: true,
          data: [{ id: 1, name: "Ada" }],
        }),
        fallback: [],
        onError: () => {
          errorCalls += 1;
        },
      });

      assert.deepEqual(users, [{ id: 1, name: "Ada" }]);
      assert.equal(errorCalls, 0);
    });

    it("preserves falsy/null data when success is true", async () => {
      let errorCalls = 0;
      const user = await apiAction<UserItem | null>({
        apiCall: async () => ({
          success: true,
          data: null,
        }),
        fallback: null,
        onError: () => {
          errorCalls += 1;
        },
      });

      assert.equal(user, null);
      assert.equal(errorCalls, 0);
    });

    it("returns undefined fallback when T includes undefined and fallback is explicitly undefined", async () => {
      let errorCalls = 0;
      const user = await apiAction<UserItem | undefined>({
        apiCall: async () => ({
          success: false,
          error: "Not found",
        }),
        fallback: undefined,
        onError: () => {
          errorCalls += 1;
        },
      });

      assert.equal(user, undefined);
      assert.equal(errorCalls, 1);
    });

    it("returns fallback and invokes onError once on non-2xx HTTP error", async () => {
      let errorCalls = 0;
      const users = await apiAction<UserItem[]>({
        apiCall: async () => ({
          ok: false,
          status: 500,
          json: async () => ({ error: "Database down" }),
        }),
        fallback: [],
        onError: () => {
          errorCalls += 1;
        },
      });

      assert.deepEqual(users, []);
      assert.equal(errorCalls, 1);
    });

    it("returns fallback and invokes onError once when ActionResponse has success: false", async () => {
      let errorCalls = 0;
      const users = await apiAction<UserItem[]>({
        apiCall: async () => ({
          success: false,
          error: "Forbidden",
        }),
        fallback: [],
        onError: () => {
          errorCalls += 1;
        },
      });

      assert.deepEqual(users, []);
      assert.equal(errorCalls, 1);
    });

    it("returns fallback and invokes onError once when success: true but data is undefined", async () => {
      let errorCalls = 0;
      let loggedMessage = "";
      const users = await apiAction<UserItem[]>({
        apiCall: async () => ({
          success: true,
          message: "OK",
        }),
        fallback: [],
        defaultErrorMessage: "Missing data",
        onError: (message) => {
          errorCalls += 1;
          loggedMessage = message;
        },
      });

      assert.deepEqual(users, []);
      assert.equal(errorCalls, 1);
      assert.equal(loggedMessage, "Missing data");
    });

    it("returns fallback and invokes onError exactly once when apiCall throws", async () => {
      let errorCalls = 0;
      const users = await apiAction<UserItem[]>({
        apiCall: async () => {
          throw new Error("Socket hang up");
        },
        fallback: [],
        onError: () => {
          errorCalls += 1;
        },
      });

      assert.deepEqual(users, []);
      assert.equal(errorCalls, 1);
    });
  });

  describe("throwOnError mode", () => {
    it("returns unwrapped data on success without invoking onError", async () => {
      let errorCalls = 0;
      const users = await apiAction<UserItem[]>({
        apiCall: async () => ({
          success: true,
          data: [{ id: 2, name: "Grace" }],
        }),
        throwOnError: true,
        onError: () => {
          errorCalls += 1;
        },
      });

      assert.deepEqual(users, [{ id: 2, name: "Grace" }]);
      assert.equal(errorCalls, 0);
    });

    it("invokes onError once and rejects with server error message", async () => {
      let errorCalls = 0;
      await assert.rejects(
        () =>
          apiAction<UserItem[]>({
            apiCall: async () => ({
              ok: false,
              status: 404,
              json: async () => ({ message: "Users not found" }),
            }),
            throwOnError: true,
            onError: () => {
              errorCalls += 1;
            },
          }),
        { name: "Error", message: "Users not found" },
      );

      assert.equal(errorCalls, 1);
    });

    it("invokes onError once and rejects with defaultErrorMessage when data is undefined", async () => {
      let errorCalls = 0;
      await assert.rejects(
        () =>
          apiAction<UserItem[]>({
            apiCall: async () => ({
              success: true,
              message: "OK",
            }),
            throwOnError: true,
            defaultErrorMessage: "No payload returned",
            onError: () => {
              errorCalls += 1;
            },
          }),
        { name: "Error", message: "No payload returned" },
      );

      assert.equal(errorCalls, 1);
    });

    it("invokes onError exactly once and rejects when apiCall throws", async () => {
      let errorCalls = 0;
      await assert.rejects(
        () =>
          apiAction<UserItem[]>({
            apiCall: async () => {
              throw new Error("ECONNREFUSED");
            },
            throwOnError: true,
            defaultErrorMessage: "Service unavailable",
            onError: () => {
              errorCalls += 1;
            },
          }),
        { name: "Error", message: "Service unavailable" },
      );

      assert.equal(errorCalls, 1);
    });
  });

  describe("type inference and mutual exclusion", () => {
    it("infers T from apiCall without widening fallback [] to never[]", async () => {
      const fetchUsers = async (): Promise<ActionResponse<UserItem[]>> => ({
        success: true,
        data: [{ id: 3, name: "Linus" }],
      });

      const users: UserItem[] = await apiAction({
        apiCall: fetchUsers,
        fallback: [],
      });

      assert.equal(users.length, 1);
    });

    it("rejects mutually exclusive or mismatched options at compile time", () => {
      const _verifyMutualExclusion = async () => {
        await apiAction<UserItem[]>({
          apiCall: async () => ({ success: true, data: [] }),
          // @ts-expect-error fallback and throwOnError are mutually exclusive
          fallback: [],
          throwOnError: true,
        });

        await apiAction<UserItem[]>({
          apiCall: async () => ({ success: true, data: [] }),
          // @ts-expect-error null is not assignable to UserItem[]
          fallback: null,
        });
      };

      assert.equal(typeof _verifyMutualExclusion, "function");
    });
  });
});
