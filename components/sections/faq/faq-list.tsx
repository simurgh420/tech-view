import { FAQCategory } from '@/types/faq';

export function FaqList({ categories }: { categories: FAQCategory[] }) {
  return (
    <div className="space-y-10">
      {categories.map(category => (
        <section key={category.id} id={category.id} className="space-y-3">
          <h2 className="text-lg font-semibold">{category.title}</h2>
          <ul className="space-y-2">
            {category.items.map((item, index) => (
              <li key={index} className="text-sm ">
                {item.question}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
