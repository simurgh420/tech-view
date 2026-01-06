import Image from 'next/image';
import Link from 'next/link';

export function PromoBanners() {
  return (
    <section>
      {/* روی موبایل: یک ستون / روی دسکتاپ: سه ستون */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* آیفون ۱۵ - بزرگ‌تر */}
        <Link
          href="/register"
          className="relative block md:col-span-2 h-75 md:h-105 rounded-2xl overflow-hidden shadow-lg"
        >
          <Image
            src="/img/banners/iphone15.png"
            alt="iPhone 15 Banner"
            fill
            className="object-cover"
          />
        </Link>

        {/* پلی‌استیشن ۵ - کوچیک‌تر */}
        <Link
          href="/products/playstation5"
          className="relative block md:col-span-1 h-75 md:h-105 rounded-2xl overflow-hidden shadow-lg"
        >
          <Image
            src="/img/banners/ps5-banner.png"
            alt="PlayStation 5 Banner"
            fill
            className="object-cover"
          />
        </Link>
      </div>
    </section>
  );
}
