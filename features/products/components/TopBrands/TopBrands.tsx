import { topBrands } from '@/components/sections/dummy/dummyTopBrands';
import { TopBrandCard } from './TopBrandCard';

export function TopBrands() {
  return (
    <section className="mt-10" dir="rtl">
      <div className="rounded-2xl border  px-6 py-10 shadow-sm ">
        <h2 className="mb-8 text-2xl font-bold">برندهای برتر</h2>

        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-6">
          {topBrands.map(brand => (
            <TopBrandCard key={brand.slug} {...brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
