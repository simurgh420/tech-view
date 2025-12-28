// types/wishlist.ts
export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    price: number;
    discountPrice?: number;
    isDiscounted: boolean;
    rating?: number;
    reviewCount: number;
  };
}
export interface WishlistPayload {
  productId: string;
  userId: string;
}
