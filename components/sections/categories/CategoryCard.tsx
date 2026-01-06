import Image from 'next/image';
import Link from 'next/link';

interface Props {
  title: string;
  image: string;
  slug: string;
}
export function CategoryCard({ title, image, slug }: Props) {
  return (
    <Link href={`/products/${slug}`} className="group">
      <div className="flex flex-col items-center text-center  rounded-lg shadow-sm transition p-4 hover:bg-gray-600 ">
        <Image
          src={image}
          alt={title}
          width={148}
          height={148}
          className="object-contain mb-3 transition-transform group-hover:scale-105"
        />
        <div className="w-0 h-0.5 bg-transparent group-hover:w-20 group-hover:bg-gray-500 group-hover:shadow-gray-500/50 group-hover:shadow-lg transition-all duration-700 ease-in-out" />
        <span className="text-sm font-medium text-gray-700 group-hover:gray-600">{title}</span>
      </div>
    </Link>
  );
}
