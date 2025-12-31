import { RegisterForm } from '@/components/sections/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <RegisterForm />
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
