// app/auth/error/page.tsx (یا هر مسیری که هست)
import { AlertTriangle } from 'lucide-react';
import { ReturnButton } from '@/components/button/return-button';
import { Card, CardContent } from '@/components/ui/card';

interface PageProps {
  searchParams: Promise<{ error: string }>;
}

const errorMessages: Record<string, string> = {
  account_not_linked: 'این حساب قبلاً به یک روش ورود دیگر متصل شده است.',
};

export default async function Page({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const message = errorMessages[error] ?? 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.';

  return (
    <div className="container mx-auto max-w-lg space-y-8 px-8 py-16" dir="rtl">
      <ReturnButton href="/auth/login" label="ورود" />

      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="rounded-full bg-destructive/10 p-3 text-destructive">
            <AlertTriangle className="size-8" />
          </span>

          <h1 className="text-2xl font-bold">خطا در ورود</h1>

          <p className="text-sm leading-7 text-destructive">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
