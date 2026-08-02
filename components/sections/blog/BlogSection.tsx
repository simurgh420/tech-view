import { ChevronLeft } from 'lucide-react';
import { getRecentPosts } from '@/services/blog/db/queries';
import Link from 'next/link';
import { BlogCard } from './BlogCard';

export async function BlogSection() {
  const recent = await getRecentPosts(3);
  if (!recent?.length) return null;

  return (
    <section className="mt-10" dir="rtl">
      <div className="space-y-8 rounded-2xl border border-gray-200 px-6 py-10 shadow-sm dark:border-gray-800 ">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">آخرین مطالب بلاگ</h2>

          <Link
            href="/blog"
            className="flex items-center gap-1 rounded text-sm text-gray-600 transition hover:text-red-600 hover:underline underline-offset-4 dark:text-gray-300 dark:hover:text-red-400"
          >
            مشاهده همه
            <ChevronLeft size={15} />
          </Link>
        </div>

        {/* Cards — از همان BlogCard مشترک استفاده می‌شود تا استایل/رفتار
            کارت بلاگ فقط یک‌جا نگه‌داری شود، نه سه نسخهٔ جدا */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
