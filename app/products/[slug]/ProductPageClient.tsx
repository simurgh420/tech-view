// 'use client';

// import { useProducts } from '@/hooks/useProducts';

// import ProductBreadcrumb from '@/components/sections/products/breadcrumb/ProductBreadcrumb';
// import ProductGallery from '@/components/sections/products/gallery/ProductGallery';
// import ProductInfo from '@/components/sections/products/info/ProductInfo';
// import ProductPriceBox from '@/components/sections/products/price/ProductPriceBox';
// import ProductSimilar from '@/components/sections/products/similar/ProductSimilar';
// import ProductSpecs from '@/components/sections/products/specs/ProductSpecs';
// import ProductTabs from '@/components/sections/products/tabs/ProductTabs';
// import { recordToArray } from '@/lib/specifications';

// type ProductPageClientProps = {
//   slug: string;
// };

// export default function ProductPageClient({ slug }: ProductPageClientProps) {
//   const { useGetProduct } = useProducts();
//   const { data: product, isLoading, isError } = useGetProduct(slug);

//   if (isLoading) {
//     return <p className="p-10 text-center">در حال بارگذاری...</p>;
//   }

//   if (isError || !product) {
//     return <p className="p-10 text-center">محصول یافت نشد ❌</p>;
//   }

//   // ایمن‌سازی داده‌ها
//   const images = product.images ?? [];
//   const thumbnail = product.thumbnail ?? null;

//   const brandName = product.brand?.name ?? product.brand?.title ?? '';
//   const categoryTitle = product.category?.title ?? product.categoryName ?? '';
//   const categorySlug = product.category?.slug ?? product.categorySlug ?? '';

//   const specsArray = product.specifications ? recordToArray(product.specifications) : [];

//   const similarProducts = product.similarProducts ?? [];
//   const reviews = product.reviews ?? [];
//   const questions = product.questions ?? [];

//   return (
//     <div className="container mx-auto py-6 space-y-12">
//       {/* Breadcrumb */}
//       <ProductBreadcrumb
//         items={[
//           { label: 'خانه', href: '/' },
//           { label: categoryTitle, href: `/category/${categorySlug}` },
//           { label: product.title },
//         ]}
//       />

//       {/* بخش بالا */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
//         {/* گالری */}
//         <div className="lg:col-span-5">
//           <ProductGallery images={images} thumbnail={thumbnail} />
//         </div>

//         {/* اطلاعات محصول */}
//         <div className="lg:col-span-4">
//           <ProductInfo
//             title={product.title}
//             brand={brandName}
//             model={product.model ?? ''}
//             rating={product.rating ?? 0}
//             ratingCount={product.ratingCount ?? 0}
//             shortDescription={product.shortDescription ?? ''}
//             keyFeatures={product.keyFeatures ?? []}
//             colors={product.colors ?? []}
//             variants={product.variants ?? []}
//           />
//         </div>

//         {/* قیمت و خرید */}
//         <div className="lg:col-span-3">
//           <ProductPriceBox
//             price={Number(product.price)}
//             discountPrice={product.discountPrice ? Number(product.discountPrice) : null}
//             stock={product.stockQuantity ?? 0}
//           />
//         </div>
//       </div>

//       {/* تب‌ها */}
//       <ProductTabs
//         description={product.description ?? ''}
//         specs={<ProductSpecs specs={specsArray} />}
//         reviews={reviews}
//         questions={questions}
//       />

//       {/* محصولات مشابه */}
//       <ProductSimilar products={similarProducts} />
//     </div>
//   );
// }
