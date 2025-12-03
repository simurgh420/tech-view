import Image from 'next/image';

interface Props {
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
}

export function ProductCard({ title, image, originalPrice, salePrice, discount }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 text-center min-h-[300px] flex flex-col justify-between">
      <Image
        src={image}
        alt={title}
        width={180}
        height={229}
        className="mx-auto mb-3 object-cover"
      />
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <div className="mt-2 text-xs text-gray-500 line-through">${originalPrice.toFixed(2)}</div>
      <div className="text-base font-bold text-[#179BD7]">${salePrice.toFixed(2)}</div>
      <div className="mb-1 text-xs text-red-500">-{discount}%</div>
    </div>
  );
}
