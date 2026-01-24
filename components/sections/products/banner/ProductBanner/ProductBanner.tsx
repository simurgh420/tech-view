import Link from 'next/link';
import Image from 'next/image';
export function ProductBanner() {
  return (
    <section>
      <div className=" h-auto">
        {/* آیفون 17 */}
        <Link href="/products/iphone17">
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
