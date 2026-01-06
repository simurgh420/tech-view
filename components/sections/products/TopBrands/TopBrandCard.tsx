import Image from 'next/image';
import Link from 'next/link';

interface Props {
  name: string;
  logo: string;
  slug: string;
}

export function TopBrandCard({ name, logo, slug }: Props) {
  return (
    <Link href={`/brands/${slug}`} className="group">
      <div className=" rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col items-center text-center gap-3">
        {/* لوگو */}
        <div className="relative w-42 h-15">
          <Image
            src={logo}
            alt={name}
            fill
            className="object-contain transition-transform duration-200 group-hover:scale-110 group-hover:opacity-100 opacity-90"
          />
        </div>
      </div>
    </Link>
  );
}
