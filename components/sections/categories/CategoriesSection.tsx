import { categories } from './categoriesData';
import { CategoryCard } from './CategoryCard';

export function CategoriesSection() {
  return (
    <section className="mt-10">
      <div className="w-max mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
        {categories.map(cat => (
          <CategoryCard key={cat.title} {...cat} />
        ))}
      </div>
    </section>
  );
}
