import Link from 'next/link';
import Image from 'next/image';

export function ProductBanner() {
  return (
    <section className="mt-10">
      <div className="rounded-2xl shadow-lg overflow-hidden">
        <Link
          href="/products/گوشی-موبایل-اپل-مدل-iphone-17-pro-max-zaa-تک-سیم-کارت-esim-ظرفیت-256-گیگابایت-و-رم-12-گیگابایت"
          className="block"
        >
          <div className="relative w-full aspect-1224/420">
            <Image
              src="/img/banners/iphone17.png"
              alt="iPhone 17 Banner"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
