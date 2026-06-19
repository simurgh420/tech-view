import { BlogPostSafe } from '@/types/blog';
import Image from 'next/image';
import Link from 'next/link';

export function BlogCard({ post }: { post: BlogPostSafe }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group  rounded-xl border  shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 duration-300 overflow-hidden flex flex-col"
      aria-label={post.title}
    >
      {/* تصویر با نسبت ثابت و گرادیانت */}
      <div className="relative w-full aspect-4/3">
        <Image
          src={post.coverImageUrl || '/Image-not-found.png'}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-2 left-2  text-xs  px-2 py-0.5 rounded-md">بلاگ</div>
      </div>

      {/* محتوا */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* عنوان */}
        <h3 className="text-sm font-semibold  group-hover:text-gray-600 line-clamp-2">
          {post.title}
        </h3>

        {/* توضیح کوتاه */}
        <p className="text-xs  line-clamp-2">{post.excerpt}</p>

        {/* نویسنده و زمان */}
        <div className="mt-auto pt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span>نویسنده</span>
          </div>
          {post.publishedAt && (
            <time>
              {new Date(post.publishedAt).toLocaleDateString('fa-IR')} • {post.readingMinutes} دقیقه
            </time>
          )}
        </div>
      </div>
    </Link>
  );
}
