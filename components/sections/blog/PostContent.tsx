import { BlogPost } from '@/types/blog';
import Image from 'next/image';
import { CalendarDays, Clock, PenLine } from 'lucide-react';
import { PostActions } from './PostActions';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import RichContentViewer from '@/components/shared/RichContentViewer';

type Props = {
  post: BlogPost;
};

export function PostContent({ post }: Props) {
  if (!post) return null;

  const {
    title,
    author,
    publishedAt,
    readingMinutes,
    coverImageUrl,
    content = '',
    tags = [],
    slug,
  } = post;

  return (
    <main dir="rtl" className="container mx-auto max-w-3xl px-4 py-10 text-right">
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* عنوان اصلی */}
      <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl md:text-5xl md:leading-tight">
        {title}
      </h1>

      {/* متادیتا */}
      <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-neutral-200 pb-6 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        {author?.name && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <PenLine size={16} className="text-neutral-700 dark:text-neutral-300" />
            </div>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {author.name}
            </span>
          </div>
        )}

        <div className="flex items-center gap-5">
          {publishedAt && (
            <time
              dateTime={new Date(publishedAt).toISOString()}
              className="flex items-center gap-1.5"
            >
              <CalendarDays size={16} />
              {new Date(publishedAt).toLocaleDateString('fa-IR-u-nu-latn')}
            </time>
          )}

          {readingMinutes && (
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              {readingMinutes} دقیقه مطالعه
            </span>
          )}
        </div>
      </div>

      <div className="mb-8">
        <PostActions slug={slug} />
      </div>

      {/* تصویر کاور */}
      <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <Image
          src={coverImageUrl || '/Image-not-found.png'}
          alt={title || 'تصویر کاور مقاله'}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>

      {/* رندر محتوای متن */}
      <div className="prose prose-lg prose-neutral max-w-none dark:prose-invert">
        <RichContentViewer html={content} />
      </div>

      {/* برچسب‌ها */}
      {tags.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <h4 className="mb-4 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            برچسب‌های این مقاله
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map(item => {
              const tag = item?.tag;
              if (!tag) return null;

              return (
                <span
                  key={tag.id}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-red-300 hover:text-red-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-red-800 dark:hover:text-red-400"
                >
                  #{tag.name}
                </span>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
