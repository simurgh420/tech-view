import { LoginForm } from '@/components/sections/auth/LoginForm';
import { SignInOauthButton } from '@/components/button/sign-in-oauth-button';
import { AuthDivider } from '@/components/sections/auth/AuthDivider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect('/admin/dashboard');

  return (
    <div>
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="text-2xl font-bold text-white">خوش برگشتی</h1>
        <p className="text-sm text-white/50">برای ادامه وارد حساب کاربری‌ات شو</p>
      </div>

      <LoginForm />

      <AuthDivider />

      <div className="flex flex-col gap-3">
        <SignInOauthButton provider="google" />
        <SignInOauthButton provider="github" />
      </div>
    </div>
  );
}
