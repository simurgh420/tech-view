// src/components/sections/blog/FeaturedPost.tsx

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock3, CalendarDays } from 'lucide-react';
import type { BlogPostSafe } from '@/types/blog';

type Props = {
  post: BlogPostSafe;
};

export function FeaturedPost({ post }: Props) {
  return (
    <section className="group">
      <Link
        href={`/blog/${post.slug}`}
        className="grid overflow-hidden rounded-3xl border border-border transition-all duration-500 hover:border-primary/30 hover:shadow-2xl lg:grid-cols-2"
      >
        {/* Image */}
        <div className="relative aspect-16/10 overflow-hidden">
          <Image
            src={post.coverImageUrl || '/Image-not-found.png'}
            alt={post.title}
            fill
            priority
            className="object-cover transition duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute right-6 top-6 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
            FEATURED
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <span className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            TECH ARTICLE
          </span>

          <h2 className="text-3xl font-black leading-tight transition-colors duration-300 group-hover:text-primary">
            {post.title}
          </h2>

          <p className="mt-6 line-clamp-3 text-base leading-8 text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {post.readingMinutes && (
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {post.readingMinutes} دقیقه مطالعه
              </span>
            )}

            {post.publishedAt && (
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString('fa-IR-u-nu-latn')}
              </span>
            )}
          </div>

          <div className="mt-10 inline-flex items-center gap-2 font-medium text-primary">
            مطالعه مقاله
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </div>
        </div>
      </Link>
    </section>
  );
}
