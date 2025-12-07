import { dummyBlogs } from '@/components/sections/dummy/blogs';
import Image from 'next/image';
import Link from 'next/link';

export function BlogSection() {
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
          href={dummyBlogs[0].link}
          className="group col-span-1 md:col-span-2 row-span-2 rounded-xl overflow-hidden shadow-lg"
        >
          <div className="relative w-full h-[300px] md:h-[420]">
            <Image
              src={dummyBlogs[0].image}
              alt={dummyBlogs[0].title}
              fill
              className="object-cover group-hover:scale-105 transition"
            />
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500">
              {dummyBlogs[0].date}•{dummyBlogs[0].readTime}
            </p>
            <h3 className="text-lg font-semibold mt-2 line-clamp-2">{dummyBlogs[0].title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{dummyBlogs[0].excerpt}</p>
          </div>
        </Link>
        {/* بلاگ دوم و سوم - سمت راست */}
        {dummyBlogs.slice(1, 3).map(blog => (
          <Link
            key={blog.id}
            href={blog.link}
            className="group rounded-xl overflow-hidden shadow-lg"
          >
            <div className="relative w-full h-[200px]">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover group-hover:scale-100 transition-transform-duration-300"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500">
                {blog.date}•{blog.readTime}
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
