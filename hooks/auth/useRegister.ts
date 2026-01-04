// hooks/auth/useRegister.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { registerService, RegisterInput } from '@/services/auth/register.service';

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) => registerService(data),
  });
}
