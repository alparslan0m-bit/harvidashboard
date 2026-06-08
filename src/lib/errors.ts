export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export function throwSupabaseError(context: string, message: string): never {
  throw new Error(`[${context}] ${message}`);
}
