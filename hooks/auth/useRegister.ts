// hooks/auth/useRegister.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { registerUserApi } from '@/services/auth/api/mutations';
import { UserPayload } from '@/types/user';

export function useRegister() {
  return useMutation({
    mutationFn: (payload: UserPayload) => registerUserApi(payload),
  });
}
