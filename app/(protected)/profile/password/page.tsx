import { ChangePasswordForm } from '@/components/sections/auth/change-password-form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PasswordSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/unauthorized');
  }

  if (!session.user) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground"
        dir="rtl"
      >
        شما وارد سیستم نشده‌اید
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6" dir="rtl">
      <Card className="w-full max-w-md border-border/60 bg-card/80 shadow-md">
        <CardHeader className="items-center space-y-2 text-center">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 p-2 text-primary">
              <KeyRound className="size-5" />
            </span>
            <CardTitle className="text-2xl font-semibold">تغییر رمز عبور</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">رمز عبور حساب خود را بروزرسانی کنید.</p>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
