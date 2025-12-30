// services/auth/utils/validators.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.email().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export function normalizeEmail(email: string): string {
  // Lowercase + trim; you can add provider-specific normalization if needed
  return email.trim().toLowerCase();
}
