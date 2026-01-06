import { LoginForm } from '@/components/sections/auth/LoginForm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function loginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-6">
      <LoginForm />
      <p className="mt-6 text-sm ">
        Don’t have an account?
        <Link
          href="/register"
          className="font-medium text-gray-600 hover:text-gray-700 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
