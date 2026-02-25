import { ChangePasswordForm } from '@/components/sections/auth/change-password-form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PasswordSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/unauthorized');
  }

  if (!session?.user) {
    return <div className="text-center text-red-500">شما وارد سیستم نشده‌اید</div>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" dir="rtl">
      <div
        className="
          w-full max-w-md 
          border  
          shadow-md 
          rounded-2xl 
          p-8 
          animate-[fadeIn_0.5s_ease-out]
          space-y-6
        "
      >
        <h1 className="text-2xl font-semibold text-center  ">تغییر رمز عبور</h1>
        <p className="text-sm text-center  ">رمز عبور حساب خود را بروزرسانی کنید.</p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
