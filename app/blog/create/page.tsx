// app/(whatever)/blog/create/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreateBlogForm } from './CreateBlogForm';

export default async function CreateBlogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-right">✍️ ایجاد بلاگ جدید</h1>
      <CreateBlogForm />
    </div>
  );
}
