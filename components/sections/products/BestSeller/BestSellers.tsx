import { getBestSellerProducts } from '@/services/products/db/queries';
import { logger } from '@/lib/logger';
import { ProductSection } from '../ProductSection';

async function getSafeBestSellers() {
  try {
    const products = await getBestSellerProducts(8);

    return products.length > 0 ? products : null;
  } catch (error) {
    logger.error('BestSellers section failed', {
      error: error instanceof Error ? error.message : 'Unknown',
    });

    return null;
  }
}

export default async function BestSellers() {
  const products = await getSafeBestSellers();

  if (!products) return null;

  return (
    <ProductSection
      title="پرفروش‌ترین‌ها"
      description="محبوب‌ترین انتخاب‌های کاربران"
      href="/products?sort=best-selling"
      products={products}
      //scroll   این پراپ برای موقع ک محصولات بالا 4 تا بشن اسکرول اضافه میکنه به اون قسمت
    />
  );
}
