import prisma from '@/services/db/client';

export async function createOrderDB(
  userId: string,
  data: {
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
) {
  return prisma.order.create({
    data: {
      userId,
      total: data.total,
      items: {
        create: data.items,
      },
      address: {
        create: data.address,
      },
    },
  });
}
