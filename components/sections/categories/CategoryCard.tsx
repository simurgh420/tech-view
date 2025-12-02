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
      <div className="flex flex-col items-center text-center bg-white rounded-lg shadow-sm transition p-4 hover:bg-gray-50">
        <Image
          src={image}
          alt={title}
          width={148}
          height={148}
          className="object-cover mb-3 transition-transform group-hover:scale-105"
        />
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{title}</span>
      </div>
    </Link>
  );
}
