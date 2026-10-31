// hooks/auth/useRegister.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { registerService } from '@/features/auth/server/register.service';
import { RegisterInput } from '@/features/auth/schemas/auth';

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) => registerService(data),
  });
}
