'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/sections/auth/RegisterForm';
import { SignInOauthButton } from '@/components/sections/button/sign-in-oauth-button';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

      <RegisterForm />

      {/* یا ورود با OAuth */}
      <div className="mt-4 w-full max-w-sm flex flex-col gap-3">
        <SignInOauthButton provider="google" signUp />
        <SignInOauthButton provider="github" signUp />
      </div>

      {/* لینک به صفحه ورود */}
      <p className="mt-6 text-sm text-gray-600">
        Already have an account?
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
