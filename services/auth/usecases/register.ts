// services/auth/usecases/register.ts
import { RegisterSchema, normalizeEmail } from '../utils/validators';
import { hashPassword } from '../utils/password';
import { findUserByEmail } from '../db/queries';
import { createUser } from '../db/mutations';
import { fail, ok, ServiceResult } from '../utils/types';

export async function registerUser(
  payload: unknown
): Promise<ServiceResult<{ id: string; email: string; name: string }>> {
  const parsed = RegisterSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input';
    return fail(message, 'INVALID_INPUT');
  }

  const name = parsed.data.name.trim();
  const email = normalizeEmail(parsed.data.email);
  const password = parsed.data.password;

  const existing = await findUserByEmail(email);
  if (existing) return fail('User already exists', 'USER_EXISTS');

  const hashed = await hashPassword(password);
  const user = await createUser({ name, email, password: hashed });

  return ok({ id: user.id, email: user.email, name: user.name ?? name });
}
