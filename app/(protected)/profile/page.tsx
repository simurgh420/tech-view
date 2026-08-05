import { UpdateUserForm } from '@/components/sections/auth/update-user-form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default async function ProfilePage() {
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

  const { name, image, phone } = session.user;

  return (
    <div className="container mx-auto max-w-lg space-y-8 px-8 py-16" dir="rtl">
      <div className="space-y-2">
        <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
          <span className="rounded-xl bg-primary/10 p-2 text-primary">
            <User className="size-5" />
          </span>
          پروفایل
        </h1>
        <p className="text-sm text-muted-foreground">
          اطلاعات حساب کاربری خود را مشاهده و ویرایش کنید.
        </p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-6">
          <UpdateUserForm name={name ?? ''} image={image ?? ''} phone={phone ?? ''} />
        </CardContent>
      </Card>
    </div>
  );
}
