// hooks/auth/useLogin.ts
'use client';

import { LoginInput } from '@/features/auth/schemas/auth';
import { loginService } from '@/features/auth/server/login.service';
import { useMutation } from '@tanstack/react-query';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) => loginService(data),
  });
}
