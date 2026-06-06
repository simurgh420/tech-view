import Image from 'next/image';
import Link from 'next/link';

interface Props {
  name: string;
  logo: string;
  slug: string;
}

export function TopBrandCard({ name, logo, slug }: Props) {
  return (
    <Link href={`/brands/${slug}`} className="group block">
      <div className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 
                      px-4 py-4 flex flex-col items-center text-center gap-3">

        {/* لوگو */}
        <div className="relative w-24 h-16">
          <Image
            src={logo}
            alt={name}
            fill
            sizes="96px"
            className="
              object-contain
              transition-transform duration-300
              group-hover:scale-110
              drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]
              dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.25)]
            "
          />
        </div>

      </div>
    </Link>
  );
}
