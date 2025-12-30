// services/auth/types.ts
export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string; code: string };

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function fail(error: string, code: string): ServiceResult<never> {
  return { ok: false, error, code };
}
