import { getRecentPosts } from '@/services/blog/db/queries';
import Image from 'next/image';
import Link from 'next/link';
export async function BlogSection() {
  const recent = await getRecentPosts(3);
  if (!recent || recent.length === 0) {
    return null; // یا یک پیام "هیچ بلاگی وجود ندارد"
  }
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Our Blogs</h2>
        <Link href="/blog" className="text-blue-600 hover:underline text-sm">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* بلاگ بزرگ سمت چپ */}
        <Link
          href={`/blog/${recent[0].slug}`}
          className="group col-span-1 md:col-span-2 row-span-2 rounded-xl overflow-hidden shadow-lg"
        >
          <div className="relative w-full h-[300px] md:h-[420]">
            <Image
              src={recent[0].coverImageUrl}
              alt={recent[0].title}
              fill
              className="object-cover group-hover:scale-105 transition"
            />
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500">
              {new Date(recent[0].publishedAt).toLocaleDateString('fa-IR')}
            </p>
            <h3 className="text-lg font-semibold mt-2 line-clamp-2">{recent[0].title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{recent[0].excerpt}</p>
          </div>
        </Link>
        {/* بلاگ دوم و سوم - سمت راست */}
        {recent.slice(1, 3).map(blog => (
          <Link
            key={blog.id}
            href={`/blog/${blog.slug}`}
            className="group rounded-xl overflow-hidden shadow-lg"
          >
            <div className="relative w-full h-[200px]">
              <Image
                src={blog.coverImageUrl}
                alt={blog.title}
                fill
                className="object-cover group-hover:scale-100 transition-transform-duration-300"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500">
                {new Date(blog.publishedAt).toLocaleDateString('fa-IR')}
              </p>
              <h3 className="text-md font-semibold mt-2 line-clamp-2">{blog.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">{blog.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
