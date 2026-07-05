// types/review.ts
export interface ReviewPayload {
  productId: string;
  authorId?: string;
  rating: number;
  title?: string;
  content: string;
}
export interface ReviewWithAuthor {
  id: string;
  productId: string;
  authorId: string | null;
  rating: number;
  title: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; image: string | null } | null;
}
