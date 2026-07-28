import { BlogPostSafe } from '@/types/blog';
import Image from 'next/image';
import Link from 'next/link';
import { PenLine } from 'lucide-react';
type Props = {
  post: BlogPostSafe;
};
export function BlogCard({ post }: Props) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="
        group flex flex-col overflow-hidden rounded-xl border border-gray-200
         shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        dark:border-gray-800
      "
      aria-label={post.title}
    >
      {/* تصویر با نسبت ثابت و گرادیانت */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-50 dark:bg-gray-950/60">
        <Image
          src={post.coverImageUrl || '/Image-not-found.png'}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-2 start-2 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
          بلاگ
        </div>
      </div>

      {/* محتوا */}
      <div className="flex flex-1 flex-col gap-2 p-4 text-start">
        {/* عنوان */}
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-red-600 dark:text-gray-100 dark:group-hover:text-red-400">
          {post.title}
        </h3>

        {/* توضیح کوتاه */}
        <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{post.excerpt}</p>

        {/* نویسنده و زمان */}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-gray-400">
          {post.authorName && (
            <div className="flex items-center gap-1.5">
              <PenLine size={12} />
              <span>{post.authorName}</span>
            </div>
          )}

          {post.publishedAt && (
            <time dateTime={post.publishedAt.toISOString()}>
              {new Date(post.publishedAt).toLocaleDateString('fa-IR-u-nu-latn')} •
              {post.readingMinutes} دقیقه
            </time>
          )}
        </div>
      </div>
    </Link>
  );
}
