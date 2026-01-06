import Link from 'next/link';
import { RegisterForm } from '@/components/sections/auth/RegisterForm';
import { SignInOauthButton } from '@/components/button/sign-in-oauth-button';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect('/admin/dashboard');
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-6">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

      <RegisterForm />

      {/* یا ورود با OAuth */}
      <div className="mt-4 w-full max-w-sm flex flex-col gap-3">
        <SignInOauthButton provider="google" signUp />
        <SignInOauthButton provider="github" signUp />
      </div>

      {/* لینک به صفحه ورود */}
      <p className="mt-6 text-sm ">
        Already have an account?
        <Link
          href="/login"
          className="font-medium text-gray-600 hover:text-gray-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
