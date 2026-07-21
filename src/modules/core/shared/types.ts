/** Shared response + pagination contracts for the core analytics platform. */

/** Uniform API envelope returned by every /api/analytics/* route. */
export type AnalyticsApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** Cursor-free, offset paginated result for admin list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Server-derived request context (never trusted from the client body). */
export interface RequestContext {
  /** Salted hash of the client IP — safe to store. */
  ipHash: string | null;
  /** Raw User-Agent header (used for parsing + audit). */
  userAgent: string | null;
  /** Referer header, if present. */
  referrer: string | null;
}
