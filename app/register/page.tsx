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
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div className="md:basis-3/4">
        <AuthVisual />
      </div>

      <div className="w-full md:basis-1/4 flex items-center justify-center p-6">
        <div
          className="
    w-full
    rounded-3xl
    p-8
    animate-[fadeIn_0.5s_ease-out]
    backdrop-blur-xl
    border 
    shadow-[0_8px_32px_rgba(0,0,0,0.35)]
  "
        >
          <h1 className="text-3xl font-semibold mb-6 text-center ">ثبت نام</h1>
          <RegisterForm />

          <div className="mt-6 flex flex-col gap-3 items-center">
            <div className="w-full max-w-sm">
              <SignInOauthButton provider="google" signUp />
            </div>

            <div className="w-full max-w-sm">
              <SignInOauthButton provider="github" signUp />
            </div>
          </div>
          <p className="mt-6 text-sm text-center  flex flex-row-reverse justify-center gap-2">
            <span>حساب داری؟</span>
            <Link
              href="/login"
              className="font-medium  dark:text-blue-400 dark:hover:text-blue-900 transition-colors"
            >
              ورود
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
