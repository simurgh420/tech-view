// app/product/category/[category]/page.tsx

import CategoryProductsClientPage from './categoryPageClient';

export default async function ProductPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return <CategoryProductsClientPage category={category} />;
}
