import { categories } from './categoriesData';
import { CategoryCard } from './CategoryCard';

export function CategoriesSection() {
  return (
    <section className="mt-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {categories.map(cat => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
