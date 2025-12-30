// hooks/auth/useSession.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const session = await authClient.getSession();
      return session;
    },
  });
}
