/**
 * Constructor options for creating an `AppError` instance.
 */
export interface AppErrorParams {
  message: string;
  statusCode: number;
  code: string;
  silent?: boolean;
  details?: Record<string, unknown>;
  cause?: unknown;
  name?: string;
}
