// types/wishlist.ts

/** تایپ کامل یک آیتم ویش‌لیست به همراه جزئیات محصول */
export interface WishlistItemWithProduct {
  id: string;
  userId: string;
  productId: string;
  createdAt: string; // از API به صورت string میاد (JSON serialized)
  product: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    price: number;
    discountPrice: number | null;
    isDiscounted: boolean;
    rating?: number | null; // در queryهای مختلف ممکنه باشه یا نباشه
    reviewCount?: number;
  };
}

/** تایپ ساده برای آیتم‌های ادمین (با اطلاعات user و محصول) */
export interface AdminWishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  product: {
    id: string;
    title: string;
    slug: string;
  };
}
