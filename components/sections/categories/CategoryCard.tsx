import Image from 'next/image';
import Link from 'next/link';

interface Props {
  title: string;
  image: string;
  slug: string;
}

export function CategoryCard({ title, image, slug }: Props) {
  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="flex flex-col items-center text-center rounded-lg shadow-sm p-4 transition-all duration-300">
        <Image
          src={image}
          alt={title}
          width={148}
          height={148}
          className="object-contain mb-3 transition-transform duration-300 group-hover:scale-105"
        />

        <div className="w-0 h-0.5 bg-transparent group-hover:w-16 group-hover:bg-gray-500 transition-all duration-500" />

        <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-gray-500 transition-colors duration-300">
          {title}
        </span>
      </div>
    </Link>
  );
}
