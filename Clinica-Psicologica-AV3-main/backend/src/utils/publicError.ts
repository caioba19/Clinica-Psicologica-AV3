export function publicErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const value = error as { code?: unknown; sql?: unknown; sqlMessage?: unknown; message?: unknown };
    if (value.code || value.sql || value.sqlMessage) return fallback;
    if (typeof value.message === 'string') return value.message;
  }
  return fallback;
}
