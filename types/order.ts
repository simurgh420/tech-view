import { Order, OrderItem, OrderAddress } from '@/app/generated/prisma/client';

export type OrderWithRelations = Order & {
  items: OrderItem[];
  address: OrderAddress | null;
};
export interface CreateOrderInput {
  total: number;
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }[];
  address: {
    fullName: string;
    phone: string;
    city: string;
    postalCode: string;
    address: string;
  };
}
