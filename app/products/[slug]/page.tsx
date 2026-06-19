// app/product/[slug]/page.tsx

import { Suspense } from 'react';
import ProductPageClient from './ProductPageClient';
import { SkeletonProductDetail } from '@/components/ui/skeleton';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deCodeSlug = decodeURIComponent(slug);

  return (
    <Suspense fallback={<SkeletonProductDetail />}>
      <ProductPageClient slug={deCodeSlug} />
    </Suspense>
  );
}
