import Image from 'next/image';
import Link from 'next/link';

interface Props {
  name: string;
  logo: string | null;
  slug: string;
}

export function TopBrandCard({ name, logo, slug }: Props) {
  return (
    <Link
      href={`/brands/${slug}`}
      className="
        group
        flex
        flex-col
        items-center
        gap-3
        rounded-xl
        px-4
        py-5
        text-center
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/30
        hover:shadow-md
      "
    >
      {/* لوگو */}
      <div className="relative h-16 w-24">
        {logo ? (
          <Image
            src={logo}
            alt={name}
            fill
            sizes="96px"
            className="
              object-contain
              transition-transform
              duration-300
              group-hover:scale-110
              drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]
              dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.15)]
            "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
            {name.charAt(0)}
          </div>
        )}
      </div>

      <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
        {name}
      </span>
    </Link>
  );
}
