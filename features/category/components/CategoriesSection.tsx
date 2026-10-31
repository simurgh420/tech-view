import { categories } from './categoriesData';
import { CategoryCard } from './CategoryCard';

export function CategoriesSection() {
  return (
    <section className="mt-10 ">
      <div className="w-full max-w-6xl mx-auto flex justify-center flex-wrap gap-6">
        {categories.map(cat => (
          <CategoryCard key={cat.title} {...cat} />
        ))}
      </div>
    </section>
  );
}
