// lib/auth/getSession.ts
import { auth } from '@/lib/auth';

export async function getSessionFromRequest(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headersObject = Object.fromEntries((req as any).headers.entries());
  return auth.api.getSession({ headers: headersObject });
}
