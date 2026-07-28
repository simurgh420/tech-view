import type { BlogPostSafe } from '@/types/blog';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';

type Props = {
  items: BlogPostSafe[];
};

export function RecentPosts({ items = [] }: Props) {
  // جلوگیری از رندر شدن بخش خالی
  if (!items.length) return null;

  return (
    <section className="mt-10" dir="rtl">
      <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-gray-100">پست‌های اخیر</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {items.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="
              group flex gap-4 rounded-xl border border-gray-200/80 p-3
              shadow-sm transition-all duration-300
              hover:-translate-y-1 hover:border-gray-300 hover:shadow-md
              dark:border-gray-800 dark:hover:border-gray-700
            "
            aria-label={post.title}
          >
            {/* تصویر کاور با افکت زوم نرم */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <Image
                src={post.coverImageUrl || '/Image-not-found.png'}
                alt={post.title || 'تصویر مقاله'}
                fill
                sizes="96px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* محتوای متنی */}
            <div className="flex flex-1 flex-col justify-center py-1 text-start">
              <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-red-600 dark:text-gray-100 dark:group-hover:text-red-400">
                {post.title}
              </h3>

              {/* متادیتا (تاریخ) */}
              {post.publishedAt && (
                <time
                  dateTime={new Date(post.publishedAt).toISOString()}
                  className="mt-auto flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
                >
                  <CalendarDays size={12} />
                  {new Date(post.publishedAt).toLocaleDateString('fa-IR-u-nu-latn', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
