import { getRecentPosts } from '@/services/blog/db/queries';
import Image from 'next/image';
import Link from 'next/link';

export async function BlogSection() {
  const recent = await getRecentPosts(3);
  if (!recent?.length) return null;

  return (
    <section className="mt-10">
      <div className="rounded-2xl shadow-lg px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">آخرین مطالب بلاگ</h2>

          <Link href="/blog" className="text-sm hover:underline underline-offset-4 rounded">
            مشاهده همه →
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recent.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl overflow-hidden shadow-sm hover:shadow-md 
                         transition-all duration-300 flex flex-col hover:-translate-y-1"
              aria-label={post.title}
            >
              {/* Image */}
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
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Category */}
                <span className="text-xs font-medium px-2 py-0.5 rounded w-fit">بلاگ</span>

                {/* Title */}
                <h3 className="text-sm font-semibold line-clamp-2 group-hover:underline underline-offset-4">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-3 flex items-center justify-between text-xs">
                  <span>نویسنده</span>

                  {post.publishedAt && (
                    <time>{new Date(post.publishedAt).toLocaleDateString('fa-IR')}</time>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
