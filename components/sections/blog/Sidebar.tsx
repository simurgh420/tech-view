import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, FolderOpen, Tag, Clock } from 'lucide-react';
import { getRecentPosts, getTagsByPostId } from '@/services/blog/db/queries';
import { blogCategories } from './sidebar/blagCategories';

type Props = {
  postId: string;
};

export async function Sidebar({ postId }: Props) {
  // اجرای همزمان کوئری‌ها جهت افزایش سرعت رندر
  const [recentPostsResult, tagsResult] = await Promise.all([
    getRecentPosts(5),
    getTagsByPostId(postId),
  ]);

  const recentPosts = recentPostsResult || [];
  const tags = tagsResult || [];

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 lg:sticky lg:top-24 lg:w-85" dir="rtl">
      {/* دسته‌بندی‌ها */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
          <FolderOpen size={16} className="text-primary" />
          دسته‌بندی‌ها
        </h4>
        <ul className="space-y-2.5 text-sm text-muted-foreground">
          {blogCategories.map(cat => (
            <li key={cat.slug}>
              <Link
                href={`/blog/category/${cat.slug}`}
                className="inline-block transition-colors hover:text-primary"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* پست‌های اخیر */}
      {recentPosts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
            <Clock size={16} className="text-primary" />
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
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border">
                    <Image
                      src={post.coverImageUrl || '/Image-not-found.png'}
                      alt={post.title || 'تصویر مقاله'}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col justify-center gap-1">
                    <h5 className="line-clamp-2 text-xs font-semibold leading-relaxed text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h5>
                    {post.publishedAt && (
                      <time
                        dateTime={new Date(post.publishedAt).toISOString()}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground"
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
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
            <Tag size={16} className="text-primary" />
            تگ‌های مقاله
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug || tag.name}`}
                className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-primary"
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
