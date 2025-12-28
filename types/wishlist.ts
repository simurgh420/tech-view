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
    thumbnail?: string | null;
    price: string;
    discountPrice?: string | null;
    isDiscounted: boolean;
  };
}
export interface WishlistPayload {
  productId: string;
  userId: string;
}
