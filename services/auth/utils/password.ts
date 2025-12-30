// services/auth/utils/password.ts
import argon2 from 'argon2';

const PEPPER = process.env.PASSWORD_PEPPER || ''; // سرور-side secret

export async function hashPassword(plain: string): Promise<string> {
  const input = plain + PEPPER;
  return await argon2.hash(input, {
    type: argon2.argon2id, // Argon2id = بهترین انتخاب امنیتی
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3, // iterations
    parallelism: 1,
  });
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  const input = plain + PEPPER;
  return await argon2.verify(hashed, input);
}
