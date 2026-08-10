import { getDiscountedProducts } from '@/services/products/db/queries';
import { logger } from '@/lib/logger';
import { ProductSection } from '../ProductSection';

async function getSafeDiscountedProducts() {
  try {
    const products = await getDiscountedProducts(10);

    return products.length > 0 ? products : null;
  } catch (error) {
    logger.error('ProductsOnSale section failed', {
      error: error instanceof Error ? error.message : 'Unknown',
    });

    return null;
  }
}

export default async function ProductsOnSale() {
  const products = await getSafeDiscountedProducts();

  if (!products) return null;

  return (
    <ProductSection
      title="پیشنهادهای ویژه"
      description="محصولات منتخب با بهترین قیمت"
      href="/products?discounted=true"
      products={products}
      //scroll   این پراپ برای موقع ک محصولات بالا 4 تا بشن اسکرول اضافه میکنه به اون قسمت 
    />
  );
}
