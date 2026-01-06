import Image from 'next/image';
import Link from 'next/link';

interface DiscountProps {
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
}
export function DiscountProductCard({
  title,
  image,
  originalPrice,
  salePrice,
  discount,
}: DiscountProps) {
  return (
    <Link
      href={`/products/${title.toLowerCase().replace(/\s+/g, '-')}`}
      className=" rounded-lg 
    shadow-sm 
    transition 
    px-4 
    text-center 
    h-75 
    flex flex-col 
    justify-between 
    cursor-pointer
    hover:shadow-lg
    hover:-translate-y-1
    hover:scale-[1.02]
    hover:border
    hover:border-primary
    duration-300
    ease-in-out
  "
    >
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 text-center h-75 flex flex-col justify-between">
        <div className="relative w-full h-37.5 mb-3">
          <Image src={image} alt={title} fill className="object-contain" />
          {discount !== undefined && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>

        {/* قیمت‌ها */}
        {originalPrice !== undefined && salePrice !== undefined && (
          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="text-xs text-gray-500 line-through">${originalPrice.toFixed(2)}</div>
            <div className="text-base font-bold text-[#179BD7]">${salePrice.toFixed(2)}</div>
          </div>
        )}
      </div>
    </Link>
  );
}
