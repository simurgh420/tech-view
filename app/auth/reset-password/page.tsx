import { ResetPasswordForm } from '@/components/sections/auth/reset-password-form';
import { ReturnButton } from '@/components/button/return-button';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const token = (await searchParams).token;

  if (!token) redirect('/auth/login');

  return (
    <div className="px-8 py-16 container mx-auto max-w-5xl space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/auth/login" label="Login" />

        <h1 className="text-3xl font-semibold"> تغییر رمز عبور</h1>
        {!token ? (
          <p className="text-sm text-center text-red-500">
            لینک معتبر نیست یا توکن ارسال نشده است.
          </p>
        ) : (
          <>
            <p className="text-sm ">رمز عبور جدید خود را وارد کنید.</p>

            <ResetPasswordForm token={token} />
          </>
        )}
      </div>
    </div>
  );
}
