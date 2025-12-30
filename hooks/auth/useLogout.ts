// hooks/auth/useLogout.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
  });
}
