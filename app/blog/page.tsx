// app/blog/page.tsx
import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { BlogGrid } from '@/components/sections/blog/BlogGrid';
import { RecentPosts } from '@/components/sections/blog/RecentPosts';
import { Pagination } from '@/components/ui/pagination';
import { getPublishedPosts, getRecentPosts } from '@/services/blog/db/queries';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Tech Heim Blog • News, Guides, and Reviews',
  description:
    'Latest tech articles, videos, and insights on phones, laptops, audio, gaming, and more.',
  openGraph: {
    title: 'Tech Heim Blog',
    description: 'Tech news, how-tos, and product reviews.',
    type: 'website',
    images: [{ url: '/og/blog.jpg', width: 1200, height: 630 }],
  },
};

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [{ items, pages, page }, recent] = await Promise.all([
    getPublishedPosts({ page: currentPage, pageSize: 12 }),
    getRecentPosts(5),
  ]);

  return (
    <main className="container mx-auto max-w-306 px-4 py-8" dir="rtl">
      <div className="mb-2">
        <Breadcrumb />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* محتوای اصلی: گرید بلاگ + صفحه‌بندی */}
        <section className="col-span-12 lg:col-span-8 xl:col-span-9">
          <BlogGrid posts={items} />
          <Pagination currentPage={page} totalPages={pages} basePath="/blog" />
        </section>

        {/* سایدبار: پست‌های اخیر — تو دسکتاپ کنار محتوا، تو موبایل زیرش */}
        <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
          <RecentPosts items={recent} />
        </aside>
      </div>
    </main>
  );
}
