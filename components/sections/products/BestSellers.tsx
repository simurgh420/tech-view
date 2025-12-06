import { bestSellers } from '@/components/sections/dummy/dummyBestSellers';
import { BestSellerCard } from './BestSellerCard';
export function BestSellers() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white px-6 py-10 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Sellers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map(product => (
            <BestSellerCard key={product.title} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
