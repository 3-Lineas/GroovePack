/**
 * @fileoverview Universal API Action Wrapper for React, Next.js, and Astro.
 * Encapsulates async operations, standardizes JSON responses, handles HTTP and business errors,
 * provides optional polymorphic Hono RPC/Fetch compatibility, and logs exclusively on errors.
 *
 * @example
 * ```typescript
 * import { apiAction } from "@/lib/api-action";
 * import { api } from "@/lib/api-client";
 *
 * // 1. Wrapping a REST / Fetch request
 * export async function getCustomersAction() {
 *   return apiAction<Customer[]>({
 *     actionName: "getCustomers",
 *     apiCall: () => api.get("/customers"),
 *     onSuccess: (customers) => {
 *       console.log(`Loaded ${customers.length} customers`);
 *     },
 *   });
 * }
 *
 * // 2. Wrapping a Hono RPC endpoint
 * export async function createProductAction(data: CreateProductInput) {
 *   return apiAction<Product>({
 *     actionName: "createProduct",
 *     apiCall: () => rpc.v1.products.$post({ json: data }),
 *   });
 * }
 * ```
 */

/**
 * Standard API action response format required across frontend applications.
 *
 * @template T - Type of the success response data.
 */
export interface ActionResponse<T = unknown> {
  /** Indicates whether the requested operation succeeded */
  success: boolean;
  /** Friendly message originating from backend or action handling */
  message?: string | unknown;
  /** Error code or detailed error message if operation failed */
  error?: string;
  /** Response payload on success */
  data?: T;
}

/**
 * Minimal subset of Response required by apiAction to handle HTTP/Hono RPC responses.
 * Avoids hard dependency on hono package while supporting native Hono ClientResponse or standard fetch Response.
 */
export interface MinimalResponse {
  /** True if HTTP status code is in 200-299 range */
  ok: boolean;
  /** HTTP status code number */
  status: number;
  /** Function returning response text */
  text: () => Promise<string>;
  /** Function returning parsed JSON object */
  json: () => Promise<unknown>;
}

/**
 * Generic interface for error loggers (compatible with Logger from @/lib/logger).
 */
export interface ErrorLogger {
  error: (message: string, context?: Record<string, unknown>, ...args: unknown[]) => void;
}

/**
 * Default internal fallback error logger when no custom Logger is injected.
 */
const defaultErrorLogger: ErrorLogger = {
  error(message: string, context?: Record<string, unknown>, ...args: unknown[]) {
    const timestamp = new Date().toISOString();
    console.error(
      `\x1b[31m[${timestamp}] [ERROR] [Web:ApiAction]\x1b[0m ${message}`,
      context ? { ...context } : "",
      ...args,
    );
  },
};

/**
 * Types of return values accepted by apiCall.
 * Can be an HTTP response (Hono RPC / fetch), a structured ActionResponse, or raw data T.
 */
export type ApiCallResult<T> = MinimalResponse | ActionResponse<T> | T;

/**
 * Configuration options required to execute an API Action.
 *
 * @template T - Type of the processed success data.
 */
export interface ApiActionOptions<T> {
  /**
   * Asynchronous function to execute.
   * Supports:
   * 1. Hono RPC / Fetch call returning MinimalResponse ({ ok, status, json(), text() })
   * 2. Direct Server Action / IPC call returning ActionResponse<T>
   * 3. Direct async function returning data payload T
   */
  apiCall: () => Promise<ApiCallResult<T>>;
  /** Optional callback to process success data (e.g. state update, analytics) */
  onSuccess?: (data: T) => Promise<void> | void;
  /** Context name of the Action for targeted error logging */
  actionName: string;
  /** Custom logger instance (must implement error method). Defaults to internal error logger. */
  logger?: ErrorLogger;
}

/**
 * Type guard for MinimalResponse (Hono RPC / fetch response).
 */
function isMinimalResponse(value: unknown): value is MinimalResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.ok === "boolean" &&
    typeof candidate.status === "number" &&
    typeof candidate.json === "function" &&
    typeof candidate.text === "function"
  );
}

/**
 * Type guard for ActionResponse<T>.
 */
function isActionResponse<T>(value: unknown): value is ActionResponse<T> {
  if (!value || typeof value !== "object") {
    return false;
  }
  return "success" in value && typeof (value as { success: unknown }).success === "boolean";
}

/**
 * Helper to safely parse JSON from raw text without throwing exceptions.
 */
function tryParseJson(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Non-JSON response text
  }
  return null;
}

/**
 * Handles HTTP responses originating from Hono RPC or fetch.
 */
async function handleHttpResponse<T>(
  response: MinimalResponse,
  actionName: string,
  logger: ErrorLogger,
): Promise<ActionResponse<T>> {
  const logContext = { actionName, status: response.status };

  // 1. Check HTTP level errors (e.g. 400, 401, 404, 500)
  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`HTTP request failed. Status: ${response.status}`, logContext, errorText);

    const errorJson = tryParseJson(errorText);
    if (errorJson && "message" in errorJson) {
      return {
        success: false,
        message: errorJson.message,
        error: typeof errorJson.error === "string" ? errorJson.error : `HTTP ${response.status}`,
      };
    }

    return {
      success: false,
      message: "No se pudo procesar la solicitud en el servidor. Por favor, intenta de nuevo.",
      error: `HTTP ${response.status}: ${errorText}`,
    };
  }

  // 2. Parse response body safely
  const parsedBody = (await response.json()) as unknown;

  // 3. Handle structured payload with success flag
  if (isActionResponse<T>(parsedBody)) {
    if (!parsedBody.success) {
      logger.error(
        "API request failed with business error",
        logContext,
        parsedBody.message || parsedBody.error,
      );
      return {
        success: false,
        message: parsedBody.message || "La operación no se pudo completar.",
        error: parsedBody.error,
      };
    }

    return {
      success: true,
      message: parsedBody.message,
      data: parsedBody.data,
    };
  }

  // 4. Raw JSON response payload
  return {
    success: true,
    data: parsedBody as T,
  };
}

/**
 * Universal wrapper for API calls in React and frontend applications.
 *
 * Features:
 * - Polymorphic: seamlessly accepts Hono RPC responses, standard fetch responses, ActionResponses, or raw promises.
 * - Strict Error-Only Logging: logs exclusively when errors occur (HTTP status != 2xx, business failure, or runtime crash).
 * - Safe error message extraction with user-friendly Spanish fallbacks.
 *
 * @template T - Type of the success data payload returned by the action.
 * @param options - Execution options including the API call, action name, and optional onSuccess callback.
 * @returns Standard ActionResponse<T> with success status, message, and typed data/error details.
 *
 * @example
 * ```typescript
 * const result = await apiAction<UserData>({
 *   actionName: "fetchUser",
 *   apiCall: () => api.get("/users/current"),
 *   onSuccess: (user) => setUser(user),
 * });
 *
 * if (result.success) {
 *   console.log("User:", result.data);
 * }
 * ```
 */
export async function apiAction<T>(options: ApiActionOptions<T>): Promise<ActionResponse<T>> {
  const { apiCall, onSuccess, actionName, logger = defaultErrorLogger } = options;
  const logContext = { actionName };

  try {
    const result = await apiCall();

    let finalResponse: ActionResponse<T>;

    if (isMinimalResponse(result)) {
      finalResponse = await handleHttpResponse<T>(result, actionName, logger);
    } else if (isActionResponse<T>(result)) {
      if (!result.success) {
        logger.error(
          "Action returned failure status",
          logContext,
          result.message || result.error,
        );
        return {
          success: false,
          message: result.message || "La operación no se pudo completar.",
          error: result.error,
        };
      }
      finalResponse = result;
    } else {
      finalResponse = {
        success: true,
        data: result,
      };
    }

    if (!finalResponse.success) {
      return finalResponse;
    }

    if (onSuccess && finalResponse.data !== undefined) {
      await onSuccess(finalResponse.data);
    }

    return finalResponse;
  } catch (error) {
    logger.error("Unexpected crash during action execution", logContext, error);

    return {
      success: false,
      message: "Ocurrió un error inesperado al procesar la solicitud. Por favor, intenta de nuevo.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
