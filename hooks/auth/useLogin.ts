// hooks/auth/useLogin.ts
'use client';

import { LoginInput } from '@/lib/validation/auth';
import { loginService } from '@/services/auth/login.service';
import { useMutation } from '@tanstack/react-query';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) => loginService(data),
  });
}
