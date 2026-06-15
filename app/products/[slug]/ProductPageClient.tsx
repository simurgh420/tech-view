//app/products/[slug]/ProductPageClient.tsx

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

  // ایمن‌سازی داده‌ها
  const images = product.images ?? [];
  const thumbnail = product.thumbnail ?? null;

  const brandName = product.brand?.name ?? '';
  const categoryTitle = product.category?.title ?? '';
  const categorySlug = product.category?.slug ?? '';
  const specsArray = product.specifications ?? [];
  const reviews = (product.reviews ?? []).map(r => ({
    rating: r.rating,
    comment: r.content,
  }));
  console.log('ProductPageClient specsArray:', JSON.stringify(specsArray, null, 2));
  return (
    <div className="container mx-auto py-6 space-y-12">
      {/* Breadcrumb */}
      <ProductBreadcrumb
        items={[
          { label: 'خانه', href: '/' },
          { label: categoryTitle, href: `/category/${categorySlug}` },
          { label: product.title },
        ]}
      />

      {/* بخش بالا */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* گالری */}
        <div className="lg:col-span-5">
          <ProductGallery images={images} thumbnail={thumbnail} />
        </div>

        {/* اطلاعات محصول */}
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

        {/* قیمت و خرید */}
        <div className="lg:col-span-3">
          <ProductPriceBox
            price={Number(product.price)}
            discountPrice={product.discountPrice ? Number(product.discountPrice) : null}
            stock={product.stockQuantity ?? 0}
             productId={product.id} 
          />
        </div>
      </div>

      {/* تب‌ها */}
      <ProductTabs
        description={product.description ?? ''}
        specsArray={specsArray}
        reviews={reviews}
        questions={[]}
      />
    </div>
  );
}
