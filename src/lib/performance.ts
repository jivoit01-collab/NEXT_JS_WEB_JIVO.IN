export function logSlowQuery(query: string, durationMs: number) {
  if (durationMs > 500) {
    console.warn(`[SLOW QUERY] ${durationMs}ms: ${query}`);
  }
}

export function measureAsync<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    if (duration > 1000) {
      console.warn(`[PERF] ${label}: ${duration.toFixed(0)}ms`);
    }
  });
}
