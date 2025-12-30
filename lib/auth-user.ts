// lib/auth-user.ts

// فیلدهای سفارشی که از BetterAuth می‌گیری
export type AuthUserExtras = {
  role: 'ADMIN' | 'USER';
  avatar: string | null;
};

// helper برای extend کردن session.user
export function withAuthUser<T>(user: T): T & AuthUserExtras {
  return user as T & AuthUserExtras;
}
