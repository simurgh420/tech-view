import { BlogPost } from '@/types/blog';
import Image from 'next/image';
import { CalendarDays, Clock, PenLine } from 'lucide-react';
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
    <main
      dir="rtl"
      className="
        container
        mx-auto
        max-w-4xl
        px-4
        py-10
        text-right
      "
    >
      <div className="mb-8">
        <Breadcrumb />
      </div>

      <h1
        className="
          mb-6
          text-3xl
          font-extrabold
          leading-tight
          tracking-tight
          text-foreground
          sm:text-4xl
          md:text-5xl
        "
      >
        {title}
      </h1>

      <div
        className="
          mb-10
          flex
          flex-wrap
          items-center
          gap-x-6
          gap-y-4
          border-b
          border-border
          pb-6
          text-sm
          text-muted-foreground
        "
      >
        {author?.name && (
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-muted
                text-primary
              "
            >
              <PenLine size={16} />
            </div>

            <span
              className="
                font-medium
                text-foreground
              "
            >
              {author.name}
            </span>
          </div>
        )}

        <div className="flex items-center gap-5">
          {publishedAt && (
            <time
              dateTime={new Date(publishedAt).toISOString()}
              className="
                flex
                items-center
                gap-1.5
              "
            >
              <CalendarDays size={16} />

              {new Date(publishedAt).toLocaleDateString('fa-IR-u-nu-latn')}
            </time>
          )}

          {readingMinutes && (
            <span
              className="
                flex
                items-center
                gap-1.5
              "
            >
              <Clock size={16} />
              {readingMinutes} دقیقه مطالعه
            </span>
          )}
        </div>
      </div>
      <div
        className="
          relative
          mb-12
          aspect-video
          w-full
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-muted
          shadow-sm
        "
      >
        <Image
          src={coverImageUrl || '/Image-not-found.png'}
          alt={title || 'تصویر کاور مقاله'}
          fill
          sizes="
            (max-width:768px) 100vw,
            896px
          "
          className="object-cover"
          priority
        />
      </div>

      <div
        className="
          prose
          prose-lg
          max-w-none
          dark:prose-invert
        "
      >
        <RichContentViewer html={content} />
      </div>

      {tags.length > 0 && (
        <section
          className="
            mt-16
            border-t
            border-border
            pt-8
          "
        >
          <h4
            className="
              mb-4
              text-sm
              font-bold
              text-foreground
            "
          >
            برچسب‌های این مقاله
          </h4>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {tags.map(item => {
              const tag = item?.tag;

              if (!tag) return null;

              return (
                <span
                  key={tag.id}
                  className="
                    rounded-full
                    border
                    border-border
                    bg-muted/30
                    px-3
                    py-1.5
                    text-sm
                    font-medium
                    text-foreground
                    transition-all
                    duration-300
                    hover:border-primary/30
                    hover:bg-primary
                    hover:text-primary-foreground
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
