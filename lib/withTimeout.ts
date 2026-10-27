/** Rejects if `promise` hasn't settled within `ms`. Used so one slow service can't hang a status check. */
export function withTimeout<T>(promise: Promise<T>, ms: number, label = "Request"): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
