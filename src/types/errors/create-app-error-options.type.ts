/**
 * Configuration options for defining a reusable domain `AppErrorFactory`.
 */
export interface CreateAppErrorOptions {
  name?: string;
  statusCode: number;
  code: string;
  defaultMessage: string;
  silent?: boolean;
}
