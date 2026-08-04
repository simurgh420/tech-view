// src/components/sections/blog/BlogCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react';
import type { BlogPostSafe } from '@/types/blog';

type Props = {
  post: BlogPostSafe;
};

export function BlogCard({ post }: Props) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
    >
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={post.coverImageUrl || '/Image-not-found.png'}
          alt={post.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur">
          TECH
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Magazine
        </span>

        <h3 className="mt-3 line-clamp-2 text-xl font-bold leading-tight transition-colors duration-300 group-hover:text-primary">
          {post.title}
        </h3>

        <p className="mt-4 line-clamp-3 flex-1 leading-7 text-muted-foreground">{post.excerpt}</p>

        <div className="mt-6 flex items-center gap-5 text-sm text-muted-foreground">
          {post.readingMinutes && (
            <span className="flex items-center gap-1.5">
              <Clock3 size={15} />
              {post.readingMinutes} دقیقه
            </span>
          )}

          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} />
              {new Date(post.publishedAt).toLocaleDateString('fa-IR-u-nu-latn')}
            </span>
          )}
        </div>

        <div className="mt-8 flex items-center gap-2 font-medium text-primary">
          مطالعه مقاله
          <ArrowLeft className="h-4 w-4 transition duration-300 group-hover:-translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
