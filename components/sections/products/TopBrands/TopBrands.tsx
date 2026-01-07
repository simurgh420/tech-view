import { topBrands } from '@/components/sections/dummy/dummyTopBrands';
import { TopBrandCard } from './TopBrandCard';

export function TopBrands() {
  return (
    <section>
      <div className=" rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold  mb-6">Top Brands</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          {topBrands.map(brand => (
            <TopBrandCard key={brand.slug} {...brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
