import { RegisterForm } from '@/components/sections/auth/RegisterForm';
import { SignInOauthButton } from '@/components/button/sign-in-oauth-button';
import { AuthDivider } from '@/components/sections/auth/AuthDivider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect('/admin/dashboard');

  return (
    <div>
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="text-2xl font-bold text-white">ساخت حساب کاربری</h1>
        <p className="text-sm text-white/50">برای شروع، اطلاعات زیر را تکمیل کنید</p>
      </div>

      <RegisterForm />

      <AuthDivider />

      <div className="flex flex-col gap-3">
        <SignInOauthButton provider="google" signUp />
        <SignInOauthButton provider="github" signUp />
      </div>
    </div>
  );
}
