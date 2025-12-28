// types/review.ts

export interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
  user?: { id: string; name: string; avatar?: string };
}
export interface ReviewPayload {
  productId: string;
  authorId?: string;
  rating: number;
  title?: string;
  content: string;
}
