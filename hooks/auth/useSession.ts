// hooks/auth/useSession.ts
'use client';

import { authClient } from '@/lib/auth/auth-client';

export function useSession() {
  return authClient.useSession();
}
