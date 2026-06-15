// store/cart-ui.store.ts
import { create } from 'zustand';

type CartUIStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useCartUI = create<CartUIStore>(set => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
