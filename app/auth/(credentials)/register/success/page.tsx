// app/register/success/page.tsx (یا هر مسیری که هست)
import { CheckCircle2 } from 'lucide-react';
import { ReturnButton } from '@/components/button/return-button';
import { Card, CardContent } from '@/components/ui/card';

export default function Page() {
  return (
    <div className="container mx-auto max-w-lg space-y-8 px-8 py-16" dir="rtl">
      <ReturnButton href="/auth/login" label="ورود" />

      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
            <CheckCircle2 className="size-8" />
          </span>

          <h1 className="text-2xl font-bold">ثبت‌نام موفق</h1>

          <p className="text-sm leading-7 text-muted-foreground">
            تبریک می‌گوییم! ثبت‌نام شما با موفقیت انجام شد. لطفاً ایمیل خود را بررسی کنید و روی لینک
            تأیید کلیک کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
