// hooks/useNotify.ts
'use client';

import { toast } from 'sonner';

export function useNotify() {
  return {
    success: (message: string, description?: string) =>
      toast.success(message, {
        description,
        duration: 2500,
      }),

    error: (message: string, description?: string) =>
      toast.error(message, {
        description,
        duration: 3000,
      }),

    info: (message: string, description?: string) =>
      toast(message, {
        description,
        duration: 2500,
      }),
  };
}
