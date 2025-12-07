import Link from 'next/link';
import Image from 'next/image';
export function ProductBanner() {
  return (
    <section>
      <div className="py-10 px-4 sm:px-6 lg:px-8 h-auto">
        {/* آیفون ۱۵ */}
        <Link href="/register">
          <Image
            src="/img/banners/iphone17.png"
            alt="iPhone 17 Banner"
            width={1224}
            height={420}
            className="object-cover w-full h-full"
          />
        </Link>
      </div>
    </section>
  );
}
