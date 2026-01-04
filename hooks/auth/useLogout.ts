// hooks/auth/useLogout.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { logoutService } from '@/services/auth/logout.service';
import { useRouter } from 'next/navigation';

export function useLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      router.push('/login');
    },
  });
}
