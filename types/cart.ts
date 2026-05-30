// types/cart.ts

export interface CartItemPayload {
  productId: string;
  quantity?: number; // default: 1
}
