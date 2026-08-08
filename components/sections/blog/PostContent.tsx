import { BlogPost } from '@/types/blog';
import Image from 'next/image';
import { CalendarDays, Clock, PenLine, UserRoundCog } from 'lucide-react';
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
  } = post;

  return (
    <div
      dir="rtl"
      className="text-right
      "
    >
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
        relative
        h-9
        w-9
        overflow-hidden
        rounded-full
        bg-muted
      "
            >
              {author.image ? (
                <Image
                  src={author.image}
                  alt={author.name ?? 'نویسنده'}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <div
                  className="
            flex
            h-full
            w-full
            items-center
            justify-center
            text-primary
          "
                >
                  <PenLine size={16} />
                </div>
              )}
            </div>

            <div className="group relative">
              <span
                className={`
          cursor-default
          font-medium
          transition-colors
          duration-200

          ${
            author.role === 'SUPER_ADMIN'
              ? 'text-yellow-500 hover:text-yellow-400'
              : author.role === 'ADMIN'
                ? 'text-emerald-500 hover:text-emerald-400'
                : author.role === 'USER'
                  ? 'text-orange-500 hover:text-orange-400'
                  : 'text-foreground hover:text-primary'
          }
        `}
              >
                {author.name}
              </span>

              {author.role && (
                <div
                  className="
            pointer-events-none
            absolute
            bottom-full
            right-0
            mb-2
            translate-y-2
            rounded-lg
            border
            border-border
            bg-popover
            px-3
            py-2
            text-xs
            text-popover-foreground
            opacity-0
            shadow-md
            transition-all
            duration-200

            group-hover:translate-y-0
            group-hover:opacity-100
          "
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <UserRoundCog size={13} />
                    {author.role === 'SUPER_ADMIN'
                      ? 'مدیر ارشد'
                      : author.role === 'ADMIN'
                        ? 'مدیر سایت'
                        : 'نویسنده'}
                  </div>
                </div>
              )}
            </div>
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
    </div>
  );
}
