// lib/auth/getSession.ts
import { auth } from '@/lib/auth';

export async function getSessionFromRequest(req: Request) {
  const headersObject = Object.fromEntries((req as any).headers.entries());
  return auth.api.getSession({ headers: headersObject });
}
