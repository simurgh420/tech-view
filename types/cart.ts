// types/cart.ts

export interface CartItemPayload {
  cartId: string;
  productId: string;
  quantity?: number; // default: 1
}
