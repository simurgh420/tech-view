// components/sections/blog/BlogSection.tsx

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { getRecentPosts } from '@/services/blog/db/queries';
import { BlogCard } from './BlogCard';

export async function BlogSection() {
  const recent = await getRecentPosts(3);
  if (!recent?.length) return null;

  return (
    <section dir="rtl">
      <div className="rounded-3xl border border-border bg-card px-6 py-10 shadow-sm md:px-10">
        {/* هدر */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mt-1 text-2xl font-black text-foreground">آخرین مطالب بلاگ</h2>
          </div>
          <Link
            href="/blog"
            className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            مشاهده همه
            <ChevronLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
          </Link>
        </div>

        {/* کارت‌ها — از همان BlogCard مشترک استفاده می‌شود */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
