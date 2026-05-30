// app/(whatever)/blog/edit//[slug]page.tsx

import { auth } from '@/lib/auth';
import { getPostBySlug } from '@/services/blog/db/queries';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { EditBlogPageClient } from './EditBlogPageClient';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import BlogError from '../../error';

interface EditBlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  // ۱. احراز هویت

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect('/unauthorized');
  }

  // ۲. دریافت پست
  let blog: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    blog = await getPostBySlug(slug);
  } catch (error) {
    console.error('Failed to fetch blog:', error);
    return <BlogError error={error as Error & { digest?: string }} />;
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

      <Suspense
        fallback={
          <div className="space-y-6 mt-8">
            <Skeleton variant="text" className="h-8 w-2/3" />
            <Skeleton variant="rect" className="h-10 w-full" />
            <Skeleton variant="rect" className="h-32 w-full" />
            <Skeleton variant="rect" className="h-10 w-full" />
            <Skeleton variant="rect" className="h-40 w-full" />
            <Skeleton variant="rect" className="h-12 w-full" />
          </div>
        }
      >
        <EditBlogPageClient
          slug={slug}
          blog={{
            title: blog.title,
            excerpt: blog.excerpt,
            coverImageUrl: blog.coverImageUrl,
            content: blog.content,
            tags: blog.tags.map(t => t.tag.name),
          }}
        />
      </Suspense>
    </div>
  );
}
