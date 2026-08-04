import type { BlogPostSafe } from '@/types/blog';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';

type Props = {
  items: BlogPostSafe[];
};

export function RecentPosts({ items = [] }: Props) {
  if (!items.length) return null;

  return (
    <section
      dir="rtl"
      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-4"
    >
      <h2 className="mb-3 text-base font-bold text-neutral-900 dark:text-neutral-100">
        پست‌های اخیر
      </h2>

      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
        {items.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            aria-label={post.title}
            className="group flex gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-950">
              <Image
                src={post.coverImageUrl || '/Image-not-found.png'}
                alt={post.title || 'تصویر مقاله'}
                fill
                sizes="56px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h3 className="line-clamp-2 text-xs font-medium leading-5 text-neutral-800 transition-colors group-hover:text-red-600 dark:text-neutral-100 dark:group-hover:text-red-400">
                {post.title}
              </h3>

              {post.publishedAt && (
                <time
                  dateTime={new Date(post.publishedAt).toISOString()}
                  className="mt-1.5 flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400"
                >
                  <CalendarDays size={11} />
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
