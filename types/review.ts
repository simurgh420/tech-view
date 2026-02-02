// types/review.ts
export interface ReviewPayload {
  productId: string;
  authorId?: string;
  rating: number;
  title?: string;
  content: string;
}
