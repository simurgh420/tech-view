// services/reviews/utils/recalculateProductRating.ts
import { Prisma } from '@/app/generated/prisma/client';

// این تابع باید داخل یک $transaction (با tx) صدا زده بشه
export async function recalculateProductRating(tx: Prisma.TransactionClient, productId: string) {
  const agg = await tx.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await tx.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? null,
      reviewCount: agg._count.rating,
    },
  });
}
