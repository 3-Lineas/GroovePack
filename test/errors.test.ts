import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { AppError, createAppError } from "@/errors/index";

describe("@3lineas/groovepack/errors", () => {
  describe("AppError", () => {
    it("sets statusCode, code, silent, details, cause, and default name", () => {
      const rootCause = new Error("DB connection lost");
      const error = new AppError({
        message: "Failed to load user",
        statusCode: 503,
        code: "USER_LOAD_FAILED",
        silent: true,
        details: { userId: "usr_123" },
        cause: rootCause,
      });

      assert.ok(error instanceof Error);
      assert.ok(error instanceof AppError);
      assert.equal(error.name, "AppError");
      assert.equal(error.message, "Failed to load user");
      assert.equal(error.statusCode, 503);
      assert.equal(error.code, "USER_LOAD_FAILED");
      assert.equal(error.silent, true);
      assert.deepEqual(error.details, { userId: "usr_123" });
      assert.equal(error.cause, rootCause);
    });

    it("supports subclassing with new.target.name", () => {
      class CustomDomainError extends AppError {}

      const error = new CustomDomainError({
        message: "Domain failure",
        statusCode: 400,
        code: "DOMAIN_FAILURE",
        silent: true,
      });

      assert.equal(error.name, "CustomDomainError");
      assert.ok(error instanceof AppError);
      assert.ok(error instanceof CustomDomainError);
    });

    it("logs via console.error when silent is false", () => {
      const errorSpy = mock.method(console, "error", () => {});

      try {
        new AppError({
          message: "Unhandled domain error",
          statusCode: 500,
          code: "UNHANDLED_DOMAIN_ERROR",
          details: { attempt: 2 },
        });

        assert.equal(errorSpy.mock.callCount(), 1);
      } finally {
        errorSpy.mock.restore();
      }
    });
  });

  describe("createAppError", () => {
    const listUsersError = createAppError({
      name: "ListUsersError",
      statusCode: 500,
      code: "USERS_LIST_FAILED",
      defaultMessage: "Could not load users.",
      silent: true,
    });

    it("exposes readonly code, statusCode, and .is() type guard", () => {
      assert.equal(listUsersError.code, "USERS_LIST_FAILED");
      assert.equal(listUsersError.statusCode, 500);

      const err = listUsersError();
      assert.equal(listUsersError.is(err), true);
      assert.equal(listUsersError.is(new Error("other")), false);

      const otherError = createAppError({
        statusCode: 404,
        code: "USER_NOT_FOUND",
        defaultMessage: "User not found",
        silent: true,
      })();
      assert.equal(listUsersError.is(otherError), false);
    });

    it("uses defaultMessage when called without arguments or with blank string", () => {
      const err1 = listUsersError();
      const err2 = listUsersError("   ");

      assert.ok(err1 instanceof AppError);
      assert.ok(err1 instanceof Error);
      assert.equal(err1.name, "ListUsersError");
      assert.equal(err1.message, "Could not load users.");
      assert.equal(err2.message, "Could not load users.");
    });

    it("overrides message and attaches details when provided", () => {
      const err = listUsersError("Slug already in use.", { slug: "acme" });

      assert.equal(err.message, "Slug already in use.");
      assert.deepEqual(err.details, { slug: "acme" });
      assert.equal(err.statusCode, 500);
      assert.equal(err.code, "USERS_LIST_FAILED");
    });

    it("logs automatically when silent is not set", () => {
      const errorSpy = mock.method(console, "error", () => {});
      const noisyError = createAppError({
        statusCode: 502,
        code: "UPSTREAM_FAILED",
        defaultMessage: "Upstream failed",
      });

      try {
        const err = noisyError();
        assert.equal(err.silent, false);
        assert.equal(errorSpy.mock.callCount(), 1);
      } finally {
        errorSpy.mock.restore();
      }
    });
  });
});
