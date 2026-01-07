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
      <div className="rounded-lg shadow-sm hover:shadow-md transition px-4 flex flex-col items-center text-center gap-3 py-2">
        {/* لوگو */}
        <div className="relative w-24 h-16 flex items-center justify-center">
          <Image
            src={logo}
            alt={name}
            fill
            className="
      object-contain 
      transition-transform duration-200 
      group-hover:scale-110 
      group-hover:opacity-100 
      opacity-90
      drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]
      dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.25)]
    "
          />
        </div>
      </div>
    </Link>
  );
}
