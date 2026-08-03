// app/products/[slug]/ProductPageClient.tsx
'use client';

import { ProductActions } from '@/components/sections/products/actions/ProductActions';
import ProductBreadcrumb from '@/components/sections/products/breadcrumb/ProductBreadcrumb';
import ProductGallery from '@/components/sections/products/gallery/ProductGallery';
import ProductInfo from '@/components/sections/products/info/ProductInfo';
import ProductPriceBox from '@/components/sections/products/price/ProductPriceBox';
import ProductTabs from '@/components/sections/products/tabs/ProductTabs';
import { SkeletonProductDetail } from '@/components/ui/skeleton';
import { useGetProduct } from '@/hooks/useProducts';

type ProductPageClientProps = {
  slug: string;
};

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const { data: product, isLoading, isError } = useGetProduct(slug);

  if (isLoading) {
    return <SkeletonProductDetail />;
  }

  if (isError || !product) {
    return <p className="p-10 text-center">محصول یافت نشد ❌</p>;
  }

  const images = product.images ?? [];
  const thumbnail = product.thumbnail ?? null;
  const brandName = product.brand?.name ?? '';
  const brandSlug = product.brand?.slug ?? '';
  const categoryTitle = product.category?.title ?? '';
  const categorySlug = product.category?.slug ?? '';
  const specsArray = product.specifications ?? [];

  return (
    <div
      className="
    mx-auto
    mb-6
    w-full
    max-w-7xl
    px-4
    py-8
    lg:px-6
  "
    >
      <ProductBreadcrumb
        items={[
          { label: 'خانه', href: '/' },
          { label: categoryTitle, href: `/category/${categorySlug}` },
          { label: product.title },
        ]}
      />
      <div className="mb-8">
        <ProductActions slug={slug} />
      </div>
      <div
        className="
    rounded-3xl
    border
    border-neutral-200/70
    bg-white
    p-5
    shadow-sm
    transition-shadow
    duration-300
    hover:shadow-md
    dark:border-neutral-800/80
    dark:bg-[#15181D]
  "
      >
        <div
          className="
    grid
    grid-cols-1
    gap-6
    lg:grid-cols-12
  "
        >
          <div className="lg:col-span-5">
            <ProductGallery images={images} thumbnail={thumbnail} productId={product.id} />
          </div>

          <div className="lg:col-span-4">
            <ProductInfo
              title={product.title}
              brand={brandName}
              brandSlug={brandSlug}
              rating={product.rating ? Number(product.rating) : 0}
              ratingCount={product.reviewCount ?? 0}
              keyFeatures={product.keyFeatures ?? []}
              colors={product.colors ?? []}
              variants={product.variants ?? []}
            />
          </div>

          <div className="lg:col-span-3">
            <ProductPriceBox
              price={Number(product.price)}
              discountPrice={product.discountPrice ? Number(product.discountPrice) : null}
              stock={product.stockQuantity ?? 0}
              productId={product.id}
            />
          </div>
        </div>
        <div
          className="
    mt-8
    overflow-hidden
    rounded-3xl
    border
    border-neutral-200/70
    bg-neutral-50
    p-6
    shadow-sm
    dark:border-neutral-800/80
    dark:bg-[#111418]
  "
        >
          <ProductTabs
            productSlug={slug}
            description={product.description ?? ''}
            specsArray={specsArray}
          />
        </div>
      </div>
    </div>
  );
}
