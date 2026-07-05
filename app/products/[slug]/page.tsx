import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { getProductBySlug } from '@/services/products/db/queries';
import { SkeletonProductDetail } from '@/components/ui/skeleton';
import ProductPageClient from './ProductPageClient';
import ProductError from './ProductError';
import { getQueryClient } from '@/lib/query/query-client';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(decodeURIComponent(slug));

  if (!product) return {};

  return {
    title: product.title,
    description: product.description?.slice(0, 150),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['product', decodedSlug],
    queryFn: () => getProductBySlug(decodedSlug),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductError>
        <Suspense fallback={<SkeletonProductDetail />}>
          <ProductPageClient slug={decodedSlug} />
        </Suspense>
      </ProductError>
    </HydrationBoundary>
  );
}
