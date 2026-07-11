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
  const { title, author, publishedAt, readingMinutes, coverImageUrl, content, tags, slug } = post;

  return (
    <main dir="rtl" className="container mx-auto max-w-3xl px-4 py-10 text-right">
      <div className="mb-6">
        <Breadcrumb />
      </div>

      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
        {title}
      </h1>

      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        {author?.name && (
          <span className="flex items-center gap-1.5">
            <PenLine size={15} />
            {author.name}
          </span>
        )}

        {publishedAt && (
          <span className="flex items-center gap-1.5">
            <CalendarDays size={15} />
            {new Date(publishedAt).toLocaleDateString('fa-IR')}
          </span>
        )}

        {readingMinutes && (
          <span className="flex items-center gap-1.5">
            <Clock size={15} />
            {readingMinutes} دقیقه مطالعه
          </span>
        )}
      </div>

      <div className="mb-8">
        <PostActions slug={slug} />
      </div>

      <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-xl bg-gray-900/10 shadow-xl">
        <Image
          src={coverImageUrl || '/Image-not-found.png'}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>

      <RichContentViewer html={content} />

      {tags.length > 0 && (
        <section className="mt-12">
          <h4 className="mb-3 text-sm font-semibold">برچسب‌ها</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="
                  rounded-full px-3 py-1 text-xs
                  bg-gray-200 text-gray-700
                  transition hover:bg-gray-300
                  dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600
                "
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
