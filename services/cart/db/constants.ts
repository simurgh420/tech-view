export const productSelect = {
  id: true,
  title: true,
  slug: true,
  thumbnail: true,
  price: true,
  discountPrice: true,
  isDiscounted: true,
  stockQuantity: true,
} as const;

export const CartErrors = {
  PRODUCT_NOT_FOUND: 'Product not found',
  INSUFFICIENT_STOCK: 'Insufficient stock',
  INSUFFICIENT_STOCK_UPDATE: 'Insufficient stock for update',
} as const;
