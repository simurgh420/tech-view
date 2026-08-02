// src/components/blog/Sidebar.tsx

import { getRecentPosts, getTagsByPostId } from '@/services/blog/db/queries';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, FolderOpen, Tag, Clock } from 'lucide-react';

type Props = {
  postId: string;
};

export async function Sidebar({ postId }: Props) {
  const categories = ['Technology Trends', 'Gaming Insights', 'Security & Privacy'];

  // فراخوانی کوئری‌ها با حد مجاز برای سیدبار
  const recentPosts = (await getRecentPosts(5)) || [];
  const tags = (await getTagsByPostId(postId)) || [];

  return (
    <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-8" dir="rtl">
      {/* دسته‌بندی‌ها */}
      <div>
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
          <FolderOpen size={16} className="text-red-600 dark:text-red-400" />
          دسته‌بندی‌ها
        </h4>
        <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
          {categories.map(cat => (
            <li key={cat}>
              <Link
                href={`/blog/category/${encodeURIComponent(cat)}`}
                className="inline-block transition-colors hover:text-red-600 dark:hover:text-red-400"
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* پست‌های اخیر */}
      {recentPosts.length > 0 && (
        <div>
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            <Clock size={16} className="text-red-600 dark:text-red-400" />
            پست‌های اخیر
          </h4>
          <ul className="space-y-4">
            {recentPosts.map(post => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-center gap-3"
                  aria-label={post.title}
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200/60 dark:border-gray-800">
                    <Image
                      src={post.coverImageUrl || '/Image-not-found.png'}
                      alt={post.title || 'تصویر مقاله'}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-col justify-center gap-1">
                    <h5 className="line-clamp-2 text-xs font-medium text-gray-900 transition-colors group-hover:text-red-600 dark:text-gray-100 dark:group-hover:text-red-400">
                      {post.title}
                    </h5>
                    {post.publishedAt && (
                      <time
                        dateTime={new Date(post.publishedAt).toISOString()}
                        className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400"
                      >
                        <CalendarDays size={11} />
                        {new Date(post.publishedAt).toLocaleDateString('fa-IR-u-nu-latn')}
                      </time>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* تگ‌ها */}
      {tags.length > 0 && (
        <div>
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
            <Tag size={16} className="text-red-600 dark:text-red-400" />
            تگ‌ها
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug || tag.name}`}
                className="
                  rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-700
                  transition-colors hover:border-red-500 hover:text-red-600
                  dark:border-gray-800 dark:text-gray-300 dark:hover:border-red-400 dark:hover:text-red-400
                "
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
