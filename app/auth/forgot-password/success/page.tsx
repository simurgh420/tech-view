import { ReturnButton } from '@/components/button/return-button';

export default function Page() {
  return (
    <div className="px-8 py-16 container mx-auto max-w-5xl space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/auth/login" label="Login" />

        <h1 className="text-3xl font-bold">موفق</h1>

        <p className="text-muted-foreground">
          موفق! لینک عوض کردن پسورد به ایمیل شما ارسال شد لطفا ایمیل خود را چک کنید
        </p>
      </div>
    </div>
  );
}
