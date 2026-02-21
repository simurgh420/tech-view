// // app/product/[slug]/page.tsx

// import ProductBreadcrumb from "@/components/sections/products/breadcrumb/ProductBreadcrumb";
// import ProductGallery from "@/components/sections/products/gallery/ProductGallery";
// import ProductInfo from "@/components/sections/products/info/ProductInfo";
// import ProductPriceBox from "@/components/sections/products/price/ProductPriceBox";
// import ProductSimilar from "@/components/sections/products/similar/ProductSimilar";
// import ProductSpecs from "@/components/sections/products/specs/ProductSpecs";
// import ProductTabs from "@/components/sections/products/tabs/ProductTabs";

// // فرض: این داده‌ها از API میاد
// async function getProduct(slug: string) {
//   // fetch...
// }

// export default async function ProductPage({ params }: { params: { slug: string } }) {
//   const product = await getProduct(params.slug);

//   return (
//     <div className="container mx-auto py-6 space-y-12">
//       {/* Breadcrumb */}
//       <ProductBreadcrumb
//         items={[
//           { label: 'خانه', href: '/' },
//           { label: product.categoryName, href: `/category/${product.categorySlug}` },
//           { label: product.title },
//         ]}
//       />

//       {/* بخش بالا */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
//         {/* گالری */}
//         <div className="lg:col-span-5">
//           <ProductGallery images={product.images} />
//         </div>

//         {/* اطلاعات محصول */}
//         <div className="lg:col-span-4">
//           <ProductInfo
//             title={product.title}
//             brand={product.brand}
//             model={product.model}
//             rating={product.rating}
//             ratingCount={product.ratingCount}
//             shortDescription={product.shortDescription}
//             keyFeatures={product.keyFeatures}
//             colors={product.colors}
//             variants={product.variants}
//           />
//         </div>

//         {/* قیمت و خرید */}
//         <div className="lg:col-span-3">
//           <ProductPriceBox
//             price={product.price}
//             discountPrice={product.discountPrice}
//             stock={product.stock}
//           />
//         </div>
//       </div>

//       {/* تب‌ها */}
//       <ProductTabs
//         description={product.description}
//         specs={<ProductSpecs specs={product.specs} />}
//         reviews={product.reviews}
//         questions={product.questions}
//       />

//       {/* محصولات مشابه */}
//       <ProductSimilar products={product.similarProducts} />
//     </div>
//   );
// }
