/**
 * Standardized API response contract shared between backend and frontend.
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}
