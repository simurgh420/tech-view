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

      {/* عنوان اصلی با تایپوگرافی مدرن‌تر */}
      <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl md:leading-tight">
        {title}
      </h1>

      {/* متادیتا (نویسنده، تاریخ، زمان مطالعه) با استایل یکپارچه و خوانا */}
      <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-gray-100 pb-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
        {author?.name && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full ">
              <PenLine size={16} className="text-gray-700 dark:text-gray-300" />
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">{author.name}</span>
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

      {/* تصویر کاور با گوشه‌های نرم‌تر و حاشیه ظریف (هماهنگ با کارت‌ها) */}
      <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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
      <div className="prose prose-lg prose-gray max-w-none dark:prose-invert">
        <RichContentViewer html={content} />
      </div>

      {/* بخش برچسب‌ها با استایل Pill مدرن */}
      {tags.length > 0 && (
        <section className="mt-16 border-t border-gray-100 pt-8 dark:border-gray-800">
          <h4 className="mb-4 text-sm font-bold text-gray-900 dark:text-gray-100">
            برچسب‌های این مقاله
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map(item => {
              const tag = item?.tag;
              if (!tag) return null;

              return (
                <span
                  key={tag.id}
                  className="
                    rounded-lg  px-3 py-1.5 text-sm font-medium text-gray-700
                    transition-colors
                     dark:text-gray-300
                  "
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
