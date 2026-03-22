// app/product/brand/[brand]/page.tsx

import BrandProductsPageClient from './brandPageClient';

export default async function ProductPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  return <BrandProductsPageClient brand={brand} />;
}
