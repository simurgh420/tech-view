import { LoginForm } from '@/components/sections/auth/LoginForm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthVisual } from '@/components/sections/auth/AuthVisual';

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:basis-3/4">
        <AuthVisual />
      </div>

      <div className="w-full md:basis-1/4 flex items-center justify-center dark:bg-neutral-900 p-6">
        <div
          className="
    w-full
    rounded-3xl
    p-8
    animate-[fadeIn_0.5s_ease-out]

    backdrop-blur-xl
    bg-white/50 dark:bg-white/50
    border border-white/20 dark:border-white/10
    shadow-[0_8px_32px_rgba(0,0,0,0.35)]
  "
        >
          <h1 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
            خوش اومدی
          </h1>

          <LoginForm />

          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-300 flex flex-row-reverse justify-center gap-2">
            <span>حساب نداری؟</span>
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              ثبت‌نام
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
