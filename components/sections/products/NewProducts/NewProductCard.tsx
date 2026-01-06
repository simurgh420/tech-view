import Image from 'next/image';
import Link from 'next/link';

interface NewProps {
  title: string;
  image: string;
  price: number;
  rating: number;
  colors?: string[];
}

export function ProductCard({ title, image, colors, price, rating }: NewProps) {
  return (
    <Link
      href={`/products/${title.toLowerCase().replace(/\s+/g, '-')}`}
      className=" rounded-lg shadow-sm transition px-4 text-center h-75 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] hover:border hover:border-primary duration-300 ease-in-out "
    >
      <div className=" rounded-lg shadow-sm hover:shadow-md transition p-4 text-center h-75 flex flex-col justify-between">
        <div className="relative w-full h-37.5 mb-3">
          <Image src={image} alt={title} fill className="object-contain" />
        </div>
        <h3 className="text-sm font-semibold  mb-1">{title}</h3>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <p className="text-sm  font-semibold">${price.toFixed(2)}</p>
          <div className="text-yellow-500 text-sm font-semibold">★{rating.toFixed(1)}</div>
        </div>
        {colors && colors.length > 0 && (
          <div className="flex justify-center gap-2 mt-2">
            {colors.map((color, i) => (
              <span
                key={i}
                className="w-4 h-4 rounded-full border "
                style={{ backgroundColor: color }}
              ></span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
