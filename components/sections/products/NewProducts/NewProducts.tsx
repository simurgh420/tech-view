import { getNewArrivalProducts } from '@/services/products/db/queries';
import { logger } from '@/lib/logger';
import { ProductSection } from '../ProductSection';

async function getSafeNewArrivals() {
  try {
    const products = await getNewArrivalProducts(10);

    return products.length > 0 ? products : null;
  } catch (error) {
    logger.error('NewProducts section failed', {
      error: error instanceof Error ? error.message : 'Unknown',
    });

    return null;
  }
}

export default async function NewProducts() {
  const products = await getSafeNewArrivals();

  if (!products) return null;

  return (
    <ProductSection
      title="تازه‌واردها"
      description="جدیدترین محصولات فروشگاه"
      href="/products?sort=newest"
      products={products}
      //scroll   این پراپ برای موقع ک محصولات بالا 4 تا بشن اسکرول اضافه میکنه به اون قسمت
    />
  );
}
