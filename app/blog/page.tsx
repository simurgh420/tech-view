// app/blog/page.tsx

import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { BlogHero } from '@/components/sections/blog/BlogHero';
import { BlogGrid } from '@/components/sections/blog/BlogGrid';
import { FeaturedPost } from '@/components/sections/blog/FeaturedPost';
import { Pagination } from '@/components/ui/pagination';
import { getPublishedPosts } from '@/services/blog/db/queries';
import { BlogSidebar } from '@/components/sections/blog/sidebar/BlogSidebar';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'TechView Magazine • اخبار، آموزش و بررسی تکنولوژی',
  description:
    'جدیدترین مقالات تخصصی، اخبار و بررسی‌های سخت‌افزار، گیمینگ و برنامه‌نویسی در مجله TechView.',
};

type PageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const { items, pages, page, total } = await getPublishedPosts({
    page: currentPage,
    pageSize: 7,
  });

  const featured = items[0];
  const gridPosts = items.slice(1);

  return (
    <main dir="rtl" className="container mx-auto max-w-7xl space-y-12 px-4 py-8">
      <Breadcrumb />

      <BlogHero />

      {featured && <FeaturedPost post={featured} />}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content */}
        <section className="lg:col-span-8 xl:col-span-9">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-primary">TECHVIEW MAGAZINE</span>

              <h2 className="mt-1 text-3xl font-black text-foreground">آخرین مقالات</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {total.toLocaleString('fa-IR')} مقاله
            </span>{' '}
          </div>

          <BlogGrid posts={gridPosts} />

          <div className="mt-10">
            <Pagination currentPage={page} totalPages={pages} basePath="/blog" />
          </div>
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <BlogSidebar />
        </aside>
      </div>
    </main>
  );
}
