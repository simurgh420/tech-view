// app/product/edit/[slug]/page.tsx

import EditProductClientPage from './EditProductPageClient';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EditProductClientPage slug={slug} />;
}
