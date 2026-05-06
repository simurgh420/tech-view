// app/(whatever)/blog/[slug]/edit/page.tsx

import { auth } from '@/lib/auth';
import { getPostBySlug } from '@/services/blog/db/queries';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { EditBlogForm } from './EditBlogForm';

interface EditBlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { slug } = await params;

  // ۱. احراز هویت

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">برای ویرایش بلاگ باید وارد شوید.</p>
      </div>
    );
  }
  // ۲. دریافت پست
  let blog: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    blog = await getPostBySlug(slug);
  } catch (error) {
    console.error('Failed to fetch blog:', error);
    return (
      <div className="text-center py-10">
        <p className="text-red-500">خطا در بارگذاری بلاگ. لطفاً بعداً تلاش کنید.</p>
      </div>
    );
  }

  if (!blog) {
    notFound();
  }

  // ۳. کنترل دسترسی
  const isAuthor = blog.authorId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isAuthor && !isAdmin) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">شما اجازه ویرایش این پست را ندارید.</p>
      </div>
    );
  }
  // ۴. ارسال داده‌ها به Client Component
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mt-6">ویرایش بلاگ ✏️</h1>
      <EditBlogForm
        slug={slug}
        blog={{
          title: blog.title,
          excerpt: blog.excerpt,
          coverImageUrl: blog.coverImageUrl,
          content: blog.content,
          tags: blog.tags.map(t => t.tag.name),
        }}
      />
    </div>
  );
}
