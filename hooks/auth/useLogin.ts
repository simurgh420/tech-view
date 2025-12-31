// hooks/auth/useLogin.ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { loginService, LoginInput } from '@/services/auth/login.service';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) => loginService(data),
  });
}
