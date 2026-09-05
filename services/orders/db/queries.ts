import prisma from '@/services/db/client';
import { logger } from '@/lib/logger';
import { adminOrderInclude, orderInclude } from '../constants';
import { OrderStatus } from '@/app/generated/prisma/enums';

export async function getOrderByIdDB(orderId: string, userId: string) {
  const startTime = Date.now();

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });

    if (!order) {
      logger.info('getOrderByIdDB: order not found', {
        orderId,
        userId,
        duration: Date.now() - startTime,
      });

      return null;
    }

    logger.info('getOrderByIdDB success', {
      orderId,
      userId,
      duration: Date.now() - startTime,
    });

    return order;
  } catch (error) {
    logger.error('getOrderByIdDB failed', {
      orderId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

export async function getUserOrdersDB(userId: string) {
  const startTime = Date.now();

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: orderInclude,
    });

    logger.info('getUserOrdersDB success', {
      userId,
      count: orders.length,
      duration: Date.now() - startTime,
    });

    return orders;
  } catch (error) {
    logger.error('getUserOrdersDB failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });

    throw error;
  }
}
/** لیست همه‌ی سفارش‌ها (برای پنل ادمین) */
export async function getAdminOrdersDB() {
  const startTime = Date.now();

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: adminOrderInclude,
    });

    logger.info('getAdminOrdersDB success', {
      count: orders.length,
      duration: Date.now() - startTime,
    });

    return orders;
  } catch (error) {
    logger.error('getAdminOrdersDB failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

/** جزئیات یک سفارش برای ادمین (بدون محدودیت userId) */
export async function getAdminOrderByIdDB(orderId: string) {
  const startTime = Date.now();

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: adminOrderInclude,
    });

    if (!order) {
      logger.info('getAdminOrderByIdDB: order not found', {
        orderId,
        duration: Date.now() - startTime,
      });
      return null;
    }

    logger.info('getAdminOrderByIdDB success', {
      orderId,
      duration: Date.now() - startTime,
    });

    return order;
  } catch (error) {
    logger.error('getAdminOrderByIdDB failed', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}

/** تغییر وضعیت سفارش توسط ادمین */
export async function updateOrderStatusDB(orderId: string, status: OrderStatus) {
  const startTime = Date.now();

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: adminOrderInclude,
    });

    logger.info('updateOrderStatusDB success', {
      orderId,
      status,
      duration: Date.now() - startTime,
    });

    return order;
  } catch (error) {
    logger.error('updateOrderStatusDB failed', {
      orderId,
      status,
      error: error instanceof Error ? error.message : 'Unknown',
      duration: Date.now() - startTime,
    });
    throw error;
  }
}
