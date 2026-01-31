// components/product/ProductCard.tsx
import Link from 'next/link';
import { ProductWithRelations } from '@/types/product';
import Image from 'next/image';

export default function ProductCard({ product }: { product: ProductWithRelations }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="border rounded-lg p-3 hover:shadow-md transition bg-white flex flex-col"
    >
      <Image
        src={product.thumbnail || '/placeholder.jpg'}
        alt={product.title}
        fill
        className="w-full h-48 object-cover rounded mb-2"
      />

      <h2 className="text-sm font-semibold line-clamp-2">{product.title}</h2>

      <div className="text-xs text-gray-500 mt-1">
        {product.specifications?.ram && `رم: ${product.specifications.ram} گیگابایت`}
        {product.specifications?.memory && ` | حافظه: ${product.specifications.memory} گیگ`}
      </div>

      <div className="mt-2 flex items-center gap-2">
        {product.discountPrice ? (
          <>
            <span className="text-red-600 font-bold text-sm">{product.discountPrice} تومان</span>
            <span className="line-through text-gray-400 text-xs">{product.price} تومان</span>
          </>
        ) : (
          <span className="font-bold text-sm">{product.price} تومان</span>
        )}
      </div>

      <div className="mt-1 text-yellow-500 text-xs">★ {product.rating || 'بدون امتیاز'}</div>
      <div className="mt-1 text-green-600 text-xs">ارسال سریع</div>

      <button className="mt-auto w-full bg-primary text-white py-1 rounded text-sm hover:bg-primary-dark">
        افزودن به سبد
      </button>
    </Link>
  );
}
