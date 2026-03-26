declare module 'proper-lockfile' {
  export function lock(file: string, options?: { retries?: object; stale?: number }): Promise<() => Promise<void>>;
  export function unlock(release: () => Promise<void>): Promise<void>;
}
