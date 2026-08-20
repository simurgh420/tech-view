import Link from 'next/link';
import HomeProductCard from './HomeProductCard';
import { HomeProduct } from '@/services/products/productIncludes';
import { HorizontalProductScroller } from './HorizontalProductList';

type Props = {
  title: string;
  description: string;
  href: string;
  products: HomeProduct[];
  scroll?: boolean;
};

export function ProductSection({ title, description, href, products, scroll = false }: Props) {
  if (!products.length) return null;

  return (
    <section className="mt-10" dir="rtl">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>

          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <Link
          href={href}
          className="
            shrink-0
            rounded-lg
            px-3
            py-1.5
            text-sm
            font-medium
            text-primary
            transition-all
            duration-300
            hover:bg-primary/10
            hover:text-primary
          "
        >
          مشاهده همه
        </Link>
      </div>

      {scroll ? (
        <HorizontalProductScroller>
          {products.map(product => (
            <div key={product.id} className="w-65 shrink-0">
              <HomeProductCard product={product} />
            </div>
          ))}
        </HorizontalProductScroller>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map(product => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
