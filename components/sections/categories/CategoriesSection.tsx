import { categories } from './categoriesData';
import { CategoryCard } from './CategoryCard';

export function CategoriesSection() {
  return (
    <section className="mt-2 px-6 sm:px-6 lg:px-6 lg:ml-25">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 justify-center">
        {categories.map(cat => (
          <CategoryCard key={cat.title} {...cat} />
        ))}
      </div>
    </section>
  );
}
