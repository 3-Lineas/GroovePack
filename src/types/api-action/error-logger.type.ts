/**
 * Optional error logger callback invoked when `apiAction` catches an unexpected error.
 */
export type ErrorLogger = (
  message: string,
  context?: Record<string, unknown>,
) => Error | void;
