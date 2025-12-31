import { LoginForm } from '@/components/sections/auth/LoginForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <LoginForm />
      <p className="mt-6 text-sm text-gray-600">
        Don’t have an account?
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
