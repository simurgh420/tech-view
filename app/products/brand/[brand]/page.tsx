// app/product/brand/[brand]/page.tsx

import BrandProductsClientPage from "./BrandPageClient";

export default async function ProductPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  return <BrandProductsClientPage brand={brand} />;
}
