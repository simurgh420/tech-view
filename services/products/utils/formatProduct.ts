// services/products/utils/formatProduct.ts
import { Product } from '@/types/product';

export function formatProduct(raw: any): Product {
  const specsMap = new Map<string, { group: string; items: { label: string; value: string }[] }>();
  if (raw.specifications && Array.isArray(raw.specifications)) {
    for (const spec of raw.specifications) {
      const groupName = spec.groupName ?? 'سایر';
      if (!specsMap.has(groupName)) {
        specsMap.set(groupName, { group: groupName, items: [] });
      }
      specsMap.get(groupName)!.items.push({ label: spec.key, value: spec.value });
    }
  }
  const specifications = Array.from(specsMap.values());

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    price: raw.price.toString(),
    discountPrice: raw.discountPrice?.toString() ?? null,
    discountPercentage: raw.discountPercentage ?? null,
    isDiscounted: raw.isDiscounted,
    isFeatured: raw.isFeatured,
    isNew: raw.isNew,
    stockQuantity: raw.stockQuantity,
    thumbnail: raw.thumbnail ?? null,
    images: raw.images ?? [],
    keyFeatures: raw.keyFeatures ?? [],
    colors: raw.colors ?? [],
    variants: raw.variants ?? [],
    specifications,
    status: raw.status,
    rating: raw.rating?.toString() ?? null,
    reviewCount: raw.reviewCount,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    publishedAt: raw.publishedAt?.toISOString() ?? null,
    brand: raw.brand ?? null,
    category: raw.category ?? null,
    subCategory: raw.subCategory ?? null,
    // ✅ اضافه شد — فقط وقتی از productWithReviews کوئری گرفته باشیم موجوده
    ...(raw.reviews !== undefined
      ? {
          reviews: raw.reviews.map((r: any) => ({
            id: r.id,
            rating: r.rating,
            title: r.title ?? null,
            content: r.content,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
            authorId: r.authorId ?? null,
            user: r.user ?? null,
          })),
        }
      : {}),
  };
}
