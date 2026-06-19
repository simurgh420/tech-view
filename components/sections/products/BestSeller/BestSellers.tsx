import { bestSellers } from '@/components/sections/dummy/dummyBestSellers';
import { BestSellerCard } from './BestSellerCard';

export function BestSellers() {
  return (
    <section className="mt-10">
      <div className="rounded-2xl shadow-lg px-6 py-10">
        <h2 className="text-2xl font-bold mb-8">Best Sellers</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map(product => (
            <BestSellerCard key={product.title} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
