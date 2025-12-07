import Image from 'next/image';

interface NewProps {
  title: string;
  image: string;
  price: number;
  rating: number;
  colors?: string[];
}

export function ProductCard({ title, image, colors, price, rating }: NewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 text-center h-[300px] flex flex-col justify-between">
      <div className="relative w-full h-[150px] mb-3">
        <Image src={image} alt={title} fill className="object-contain" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
      <div className="flex items-center justify-between gap-2 mt-auto">
        <p className="text-sm text-gray-800 font-semibold">${price.toFixed(2)}</p>
        <div className="text-yellow-500 text-sm font-semibold">★{rating.toFixed(1)}</div>
      </div>
      {colors && colors.length > 0 && (
        <div className="flex justify-center gap-2 mt-2">
          {colors.map((color, i) => (
            <span
              key={i}
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            ></span>
          ))}
        </div>
      )}
    </div>
  );
}
