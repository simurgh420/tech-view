import { BlogPost } from '@/types/blog';
import Image from 'next/image';
import { PostActions } from './PostActions';
import { Breadcrumb } from '@/components/layout/breadcrumb';

type Props = {
  post: BlogPost;
};

export function PostContent({ post }: Props) {
  const { title, author, publishedAt, readingMinutes, coverImageUrl, content, tags, slug } = post;

  return (
    <main
      className="
        container mx-auto max-w-3xl px-4 py-10
        prose prose-lg prose-neutral dark:prose-invert
        prose-headings:font-bold prose-headings:tracking-tight
        prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
        prose-p:leading-8 prose-p:text-[17px]
        prose-img:rounded-xl prose-img:shadow-lg
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500
        prose-blockquote:bg-gray-100 dark:prose-blockquote:bg-gray-800
        prose-blockquote:py-3 prose-blockquote:px-4
        prose-code:bg-gray-200 dark:prose-code:bg-gray-800
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:text-gray-100
        prose-pre:rounded-xl prose-pre:p-4
      "
    >
      {/* مسیر صفحه */}
      <div className="mb-6 not-prose">
        <Breadcrumb />
      </div>

      {/* عنوان */}
      <h1 className="mb-4">{title}</h1>

      {/* اطلاعات پست */}
      <div className="not-prose text-sm text-gray-500 dark:text-gray-400 mb-8 flex flex-wrap items-center gap-4">
        {author?.name && <span>🖊 {author.name}</span>}

        {publishedAt && <span>📅 {new Date(publishedAt).toLocaleDateString('fa-IR')}</span>}

        {readingMinutes && <span>⏱ {readingMinutes} دقیقه مطالعه</span>}
      </div>

      {/* اکشن‌ها */}
      <div className="not-prose mb-8">
        <PostActions slug={slug} />
      </div>

      {/* تصویر کاور */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl mb-10 bg-gray-900/10">
        <Image
          src={coverImageUrl || '/Image-not-found.png'}
          alt={title}
          width={808}
          height={406}
          className="object-cover"
          priority
        />
      </div>

      {/* محتوای HTML */}
      <article dangerouslySetInnerHTML={{ __html: content }} />

      {/* برچسب‌ها */}
      {tags.length > 0 && (
        <section className="not-prose mt-12">
          <h4 className="text-sm font-semibold mb-3">برچسب‌ها</h4>

          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="
                  text-xs px-3 py-1 rounded-full
                  bg-gray-200 dark:bg-gray-700
                  text-gray-700 dark:text-gray-200
                  hover:bg-gray-300 dark:hover:bg-gray-600
                  transition
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
