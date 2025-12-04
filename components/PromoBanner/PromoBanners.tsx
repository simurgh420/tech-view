import Image from 'next/image';
import Link from 'next/link';

export function PromoBanners() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* آیفون ۱۵ */}
        <Link
          href="/register"
          className="relative block h-[300px] rounded-2xl overflow-hidden shadow-lg"
        >
          <Image
            src="/img/banners/iphone15.png"
            alt="iPhone 15 Banner"
            width={756}
            height={420}
            className="object-cover"
          />
        </Link>

        {/* پلی‌استیشن ۵ */}
        <Link
          href="/products/playstation5"
          className="relative block h-[300px] rounded-2xl overflow-hidden shadow-lg"
        >
          <Image
            src="/img/banners/ps5-banner.png"
            alt="PlayStation 5 Banner"
            width={444}
            height={400}
            className="object-cover"
          />
        </Link>
      </div>
    </section>
  );
}
