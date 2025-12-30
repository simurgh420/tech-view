// lib/auth-user.ts

// فیلدهای سفارشی که از BetterAuth می‌گیری
export type AuthUserExtras = {
  role: 'ADMIN' | 'USER';
  avatar: string | null;
};

// helper برای extend کردن session.user
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuthUser(data: any) {
  if (!data) return null;
  return { user: data.user ?? null, session: data.session ?? null };
}
