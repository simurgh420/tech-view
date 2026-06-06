import { topBrands } from '@/components/sections/dummy/dummyTopBrands';
import { TopBrandCard } from './TopBrandCard';

export function TopBrands() {
  return (
    <section className="mt-10">
      <div className="rounded-2xl shadow-lg px-6 py-10">
        <h2 className="text-2xl font-bold mb-8">Top Brands</h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          {topBrands.map(brand => (
            <TopBrandCard key={brand.slug} {...brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
