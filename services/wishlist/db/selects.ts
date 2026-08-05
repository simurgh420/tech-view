// services/wishlist/db/selects.ts


export const wishlistProductSelect = {
  id: true,
  title: true,
  slug: true,
  thumbnail: true,
  price: true,
  discountPrice: true,
  isDiscounted: true,
  rating: true,
  reviewCount: true,
} as const;

/**
 * Select مشترک برای اطلاعات کاربر (در بخش ادمین و موارد دیگر)
 */
export const wishlistUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

/**
 * Select مشترک برای محصول در بخش ادمین
 * (فقط شناسه و عنوان کافی است)
 */
export const wishlistAdminProductSelect = {
  id: true,
  title: true,
  slug: true,
} as const;
