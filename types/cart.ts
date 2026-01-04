// types/cart.ts

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  priceAtAdd: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    price: number;
    discountPrice?: number;
    isDiscounted: boolean;
    stockQuantity: number;
    isInStock: boolean;
  };
}

export interface CartItemPayload {
  cartId: string;
  productId: string;
  quantity?: number; // default: 1
}
