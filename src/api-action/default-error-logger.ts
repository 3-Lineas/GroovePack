import type { ErrorLogger } from "@/types/api-action/error-logger.type";

/**
 * Default error logger used when `onError` is not provided to `apiAction`.
 */
export const defaultErrorLogger: ErrorLogger = (message, context) => {
  if (context) {
    console.error(`[apiAction] ${message}`, context);
    return;
  }
  console.error(`[apiAction] ${message}`);
};
