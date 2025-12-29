import { getRecentPosts } from '@/services/blog/db/queries';
import Image from 'next/image';
import Link from 'next/link';

export async function BlogSection() {
  const recent = await getRecentPosts(3);
  if (!recent?.length) return null;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">آخرین مطالب بلاگ</h2>
        <Link
          href="/blog"
          className="text-sm text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
        >
          مشاهده همه →
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recent.map(post => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1 duration-300 flex flex-col"
            aria-label={post.title}
          >
            {/* Image */}
            <div className="relative w-full aspect-4/3">
              <Image
                src={post.coverImageUrl || '/images/blog-fallback.jpg'}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 flex-1">
              {/* Category */}
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                بلاگ
              </span>

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:underline underline-offset-4">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-xs text-gray-600 line-clamp-2">{post.excerpt}</p>

              {/* Footer */}
              <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>نویسنده</span>
                </div>
                <time>{new Date(post.publishedAt).toLocaleDateString('fa-IR')}</time>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
