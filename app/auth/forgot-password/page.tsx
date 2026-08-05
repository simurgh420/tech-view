import { ForgotPasswordForm } from '@/components/sections/auth/forgot-password-form';
import { ReturnButton } from '@/components/button/return-button';

export default function ForgotPasswordPage() {
  return (
    <div className="px-8 py-16 container mx-auto max-w-5xl space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/auth/login" label="Login" />

        <h1 className="text-3xl font-semibold text-center  ">فراموشی رمز عبور</h1>

        <p className="text-sm text-center ">
          ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود.
        </p>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
