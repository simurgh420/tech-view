import { Order, OrderItem, OrderAddress } from '@/app/generated/prisma/client';

export type OrderWithRelations = Order & {
  items: OrderItem[];
  address: OrderAddress | null;
};
