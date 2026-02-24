// hooks/auth/useRegister.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { registerService } from '@/services/auth/register.service';
import { RegisterInput } from '@/lib/validation/auth';

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) => registerService(data),
  });
}
