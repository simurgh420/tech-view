// src/components/blog/sidebar/SidebarRecentPosts.tsx

import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock3 } from 'lucide-react';

import { SidebarCard } from './SidebarCard';
import type { BlogPostSafe } from '@/types/blog';

type Props = {
  posts: BlogPostSafe[];
};

export function SidebarRecentPosts({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <SidebarCard title="آخرین مقالات" icon={<Clock3 size={18} />}>
      <div className="space-y-5">
        {posts.map(post => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-muted/40"
          >
            {/* Image */}

            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border">
              <Image
                src={post.coverImageUrl || '/Image-not-found.png'}
                alt={post.title}
                fill
                sizes="80px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Content */}

            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <h4 className="line-clamp-2 text-sm font-semibold leading-6 text-foreground transition-colors duration-300 group-hover:text-primary">
                {post.title}
              </h4>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {post.publishedAt && (
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} />

                    {new Date(post.publishedAt).toLocaleDateString('fa-IR-u-nu-latn')}
                  </span>
                )}

                {post.readingMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock3 size={13} />
                    {post.readingMinutes} دقیقه
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SidebarCard>
  );
}
