import Link from 'next/link';
import { RegisterForm } from '@/components/sections/auth/RegisterForm';
import { SignInOauthButton } from '@/components/button/sign-in-oauth-button';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthVisual } from '@/components/sections/auth/AuthVisual';

export default async function RegisterPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row" dir="rtl">
      <div className="md:basis-3/4">
        <AuthVisual />
      </div>

      <div className="flex w-full items-center justify-center p-6 md:basis-1/4">
        <div className="w-full animate-[fadeIn_0.5s_ease-out] rounded-3xl border p-8 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h1 className="mb-6 text-center text-3xl font-semibold">ثبت نام</h1>

          <RegisterForm />

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="w-full max-w-sm">
              <SignInOauthButton provider="google" signUp />
            </div>

            <div className="w-full max-w-sm">
              <SignInOauthButton provider="github" signUp />
            </div>
          </div>

          <p className="mt-6 flex flex-row-reverse justify-center gap-2 text-center text-sm">
            <span>حساب داری؟</span>
            <Link
              href="/login"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              ورود
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
