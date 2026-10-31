import Image from 'next/image';
import Link from 'next/link';

export function PromoBanners() {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/products/iphone17"
          className="relative block md:col-span-2 h-75 md:h-105 rounded-2xl overflow-hidden shadow-lg"
        >
          <Image
            src="/img/banners/iphone15.png"
            alt="iPhone 15 Banner"
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover"
          />
        </Link>

        <Link
          href="/products/playstation5"
          className="relative block md:col-span-1 h-75 md:h-105 rounded-2xl overflow-hidden shadow-lg"
        >
          <Image
            src="/img/banners/ps5-banner.png"
            alt="PlayStation 5 Banner"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </Link>
      </div>
    </section>
  );
}
