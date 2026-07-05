// app/products/[slug]/ProductPageClient.tsx
'use client';

import { useProducts } from '@/hooks/useProducts';

import ProductBreadcrumb from '@/components/sections/products/breadcrumb/ProductBreadcrumb';
import ProductGallery from '@/components/sections/products/gallery/ProductGallery';
import ProductInfo from '@/components/sections/products/info/ProductInfo';
import ProductPriceBox from '@/components/sections/products/price/ProductPriceBox';
import ProductTabs from '@/components/sections/products/tabs/ProductTabs';
import { SkeletonProductDetail } from '@/components/ui/skeleton';

type ProductPageClientProps = {
  slug: string;
};

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const { useGetProduct } = useProducts();
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
  const categoryTitle = product.category?.title ?? '';
  const categorySlug = product.category?.slug ?? '';
  const specsArray = product.specifications ?? [];

  return (
    <div className="container mx-auto space-y-12 py-6">
      <ProductBreadcrumb
        items={[
          { label: 'خانه', href: '/' },
          { label: categoryTitle, href: `/category/${categorySlug}` },
          { label: product.title },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ProductGallery images={images} thumbnail={thumbnail} />
        </div>

        <div className="lg:col-span-4">
          <ProductInfo
            title={product.title}
            brand={brandName}
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

      <ProductTabs
        productSlug={slug}
        description={product.description ?? ''}
        specsArray={specsArray}
      />
    </div>
  );
}
