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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Our Blogs</h2>
        <Link
          href="/blog"
          className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition"
        >
          View all →
        </Link>
      </div>

      {/* Layout: در دسکتاپ مثل فیگما، در موبایل استک‌شده */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Main Card */}
        <Link
          href={`/blog/${recent[0].slug}`}
          className="group lg:flex-2 rounded-xl overflow-hidden border bg-white hover:shadow-sm transition flex flex-col"
        >
          <div className="relative h-50 sm:h-70 w-full">
            <Image
              src={recent[0].coverImageUrl || ''}
              alt={recent[0].title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              priority
            />
          </div>

          <div className="p-4 space-y-1.5">
            <p className="text-xs text-gray-400">
              {new Date(recent[0].publishedAt).toLocaleDateString('fa-IR')}
            </p>

            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:underline underline-offset-4">
              {recent[0].title}
            </h3>

            <p className="text-sm text-gray-600 line-clamp-3">{recent[0].excerpt}</p>
          </div>
        </Link>

        {/* Right: Two stacked cards filling full height */}
        <div className="lg:flex-1 flex flex-col gap-6 lg:h-auto">
          {recent.slice(1).map(blog => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="
                group rounded-xl overflow-hidden border bg-white hover:shadow-sm transition
                flex-1 flex flex-col
              "
            >
              <div className="relative w-full h-28 sm:h-50">
                <Image
                  src={blog.coverImageUrl || ''}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              {/* متن بقیه فضا را می‌گیرد */}
              <div className="p-4 flex flex-col justify-between gap-2 flex-1">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:underline underline-offset-4">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{blog.excerpt}</p>
                </div>

                <span className="text-sm text-gray-400 mt-auto">
                  {new Date(blog.publishedAt).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
