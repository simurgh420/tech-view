// @vitest-environment node
// tests/integration/app/api/orders/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/features/cart/server/queries', () => ({
  getCartForCheckout: vi.fn(),
}));

vi.mock('@/features/orders/server/mutations', () => ({
  createOrderDB: vi.fn(),
}));

vi.mock('@/features/orders/server/queries', () => ({
  getUserOrdersDB: vi.fn(),
}));

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getCartForCheckout } from '@/features/cart/server/queries';
import { createOrderDB } from '@/features/orders/server/mutations';
import { getUserOrdersDB } from '@/features/orders/server/queries';
import { GET, POST } from '@/app/api/orders/route';

const getSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;
const getCart = vi.mocked(getCartForCheckout);
const createOrder = vi.mocked(createOrderDB);
const getOrders = vi.mocked(getUserOrdersDB);

const requestHeaders = new Headers({ cookie: 'session=abc' });
const user = { id: 'user-1', role: 'USER' };

/** شبیه Decimal پریزما: فقط toString دارد */
const decimal = (v: string | number) => ({ toString: () => String(v) });

const validAddress = {
  fullName: 'علی رضایی',
  phone: '09123456789',
  city: 'تهران',
  postalCode: '1234567890',
  address: 'تهران، خیابان ولیعصر، پلاک 10',
};

const cartItem = (
  overrides: Record<string, unknown> = {},
  product: Record<string, unknown> = {}
) => ({
  quantity: 1,
  product: {
    id: 'p1',
    title: 'آیفون ۱۵',
    price: decimal(1000),
    discountPrice: null,
    ...product,
  },
  ...overrides,
});

const makeCart = (items: unknown[] = [cartItem()]) => ({ items }) as any;

const callPOST = (body?: unknown) =>
  POST(
    new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  );

const callPOSTRaw = (raw: string) =>
  POST(new Request('http://localhost/api/orders', { method: 'POST', body: raw }));

describe('/api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(requestHeaders as any);
    getSession.mockResolvedValue({ user });
    getCart.mockResolvedValue(makeCart());
    createOrder.mockResolvedValue({ id: 'order-1' } as any);
    getOrders.mockResolvedValue([]);
  });

  // ═════════════════════════════════════════════════════
  // POST
  // ═════════════════════════════════════════════════════
  describe('POST', () => {
    describe('احراز هویت', () => {
      it('should read the session using the request headers', async () => {
        await callPOST(validAddress);

        expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });
      });

      it.each([[null], [{ user: null }]])('should return 401 for session %j', async session => {
        getSession.mockResolvedValue(session);

        const res = await callPOST(validAddress);

        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ error: 'Unauthorized' });
      });

      it('should NOT read the cart or create an order when unauthenticated', async () => {
        getSession.mockResolvedValue(null);

        await callPOST(validAddress);

        expect(getCart).not.toHaveBeenCalled();
        expect(createOrder).not.toHaveBeenCalled();
      });

      it('should log a warning when unauthenticated', async () => {
        getSession.mockResolvedValue(null);

        await callPOST(validAddress);

        expect(logger.warn).toHaveBeenCalledWith('POST /api/orders - Unauthorized', {
          duration: expect.any(Number),
        });
      });
    });

    describe('اعتبارسنجی آدرس (400)', () => {
      it('should return 400 with the formatted zod errors', async () => {
        const res = await callPOST({ ...validAddress, fullName: 'ab' });
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.fullName._errors).toEqual(['نام معتبر نیست']);
      });

      it('should report all invalid fields at once', async () => {
        const res = await callPOST({});
        const body = await res.json();

        expect(res.status).toBe(400);
        for (const field of ['fullName', 'phone', 'city', 'postalCode', 'address']) {
          expect(body).toHaveProperty(field);
        }
      });

      it.each([null, 'text', 123, []])(
        'should return 400 for a non-object body (%j)',
        async body => {
          expect((await callPOST(body)).status).toBe(400);
        }
      );

      it('should NOT read the cart or create an order when validation fails', async () => {
        await callPOST({ ...validAddress, phone: '1' });

        expect(getCart).not.toHaveBeenCalled();
        expect(createOrder).not.toHaveBeenCalled();
      });

      it('should log a validation warning with the issues (not the whole input)', async () => {
        await callPOST({ ...validAddress, city: 'ت' });

        expect(logger.warn).toHaveBeenCalledWith('POST /api/orders - Validation failed', {
          errors: expect.arrayContaining([expect.objectContaining({ path: ['city'] })]),
          duration: expect.any(Number),
        });
      });
    });

    describe('سبد خرید خالی (400)', () => {
      it.each([
        [null, 'null cart'],
        [makeCart([]), 'cart without items'],
      ])('should return 400 for %#', async cart => {
        getCart.mockResolvedValue(cart as any);

        const res = await callPOST(validAddress);

        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'Cart is empty' });
        expect(createOrder).not.toHaveBeenCalled();
      });

      it('should read the cart of the SESSION user', async () => {
        await callPOST(validAddress);

        expect(getCart).toHaveBeenCalledWith('user-1');
      });

      it('should log a warning with the userId', async () => {
        getCart.mockResolvedValue(null as any);

        await callPOST(validAddress);

        expect(logger.warn).toHaveBeenCalledWith('POST /api/orders - Cart empty', {
          userId: 'user-1',
          duration: expect.any(Number),
        });
      });
    });

    describe('ساخت سفارش', () => {
      it('should return success with the new order id', async () => {
        createOrder.mockResolvedValue({ id: 'order-42' } as any);

        const res = await callPOST(validAddress);

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ success: true, orderId: 'order-42' });
      });

      it('should create the order for the session user with the validated address', async () => {
        await callPOST(validAddress);

        expect(createOrder).toHaveBeenCalledTimes(1);
        expect(createOrder).toHaveBeenCalledWith('user-1', {
          items: expect.any(Array),
          total: expect.any(Number),
          address: validAddress,
        });
      });

      it('should map cart items to order items (productId, title, price, quantity)', async () => {
        getCart.mockResolvedValue(
          makeCart([
            cartItem({ quantity: 2 }, { id: 'p1', title: 'A', price: decimal(500) }),
            cartItem({ quantity: 1 }, { id: 'p2', title: 'B', price: decimal(1000) }),
          ])
        );

        await callPOST(validAddress);

        expect(createOrder.mock.calls[0][1].items).toEqual([
          { productId: 'p1', title: 'A', price: 500, quantity: 2 },
          { productId: 'p2', title: 'B', price: 1000, quantity: 1 },
        ]);
      });

      it('should use discountPrice when present', async () => {
        getCart.mockResolvedValue(
          makeCart([cartItem({}, { price: decimal(1000), discountPrice: decimal(800) })])
        );

        await callPOST(validAddress);

        expect(createOrder.mock.calls[0][1].items[0].price).toBe(800);
      });

      it('should fall back to price when discountPrice is null', async () => {
        getCart.mockResolvedValue(makeCart([cartItem({}, { discountPrice: null })]));

        await callPOST(validAddress);

        expect(createOrder.mock.calls[0][1].items[0].price).toBe(1000);
      });

      it('should convert Decimal prices (including fractions) to numbers', async () => {
        getCart.mockResolvedValue(makeCart([cartItem({}, { price: decimal('1500.75') })]));

        await callPOST(validAddress);

        expect(createOrder.mock.calls[0][1].items[0].price).toBe(1500.75);
      });

      it('should compute total as the sum of price × quantity', async () => {
        getCart.mockResolvedValue(
          makeCart([
            cartItem({ quantity: 2 }, { price: decimal(500) }),
            cartItem({ quantity: 3 }, { price: decimal(1000), discountPrice: decimal(900) }),
          ])
        );

        await callPOST(validAddress);

        expect(createOrder.mock.calls[0][1].total).toBe(2 * 500 + 3 * 900);
      });

      it('should price the order from the DATABASE cart, ignoring prices sent by the client', async () => {
        await callPOST({
          ...validAddress,
          total: 1,
          items: [{ productId: 'p1', price: 1, quantity: 99 }],
          userId: 'evil-user',
        });

        const [userId, data] = createOrder.mock.calls[0];
        expect(userId).toBe('user-1');
        expect(data.total).toBe(1000);
        expect(data.items).toEqual([
          { productId: 'p1', title: 'آیفون ۱۵', price: 1000, quantity: 1 },
        ]);
      });

      it('should strip unknown fields from the address', async () => {
        await callPOST({ ...validAddress, isAdmin: true, total: 1 });

        expect(createOrder.mock.calls[0][1].address).toEqual(validAddress);
      });

      it('should log success with userId and orderId', async () => {
        await callPOST(validAddress);

        expect(logger.info).toHaveBeenCalledWith('POST /api/orders - Order created', {
          userId: 'user-1',
          orderId: 'order-1',
          duration: expect.any(Number),
        });
      });

      it('should NOT log personal data (address, phone)', async () => {
        await callPOST(validAddress);

        const logged = JSON.stringify([
          ...vi.mocked(logger.info).mock.calls,
          ...vi.mocked(logger.warn).mock.calls,
        ]);
        expect(logged).not.toContain(validAddress.phone);
        expect(logged).not.toContain(validAddress.address);
      });
    });

    describe('خطا (500)', () => {
      it('should return a generic 500 and NOT leak the error message', async () => {
        createOrder.mockRejectedValue(new Error('connection to db-prod-01 refused'));

        const res = await callPOST(validAddress);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body).toEqual({ error: 'Server error' });
        expect(JSON.stringify(body)).not.toContain('db-prod-01');
      });

      it('should log the error', async () => {
        createOrder.mockRejectedValue(new Error('DB down'));

        await callPOST(validAddress);

        expect(logger.error).toHaveBeenCalledWith('POST /api/orders failed', {
          error: 'DB down',
          duration: expect.any(Number),
        });
        expect(logger.info).not.toHaveBeenCalled();
      });

      it('should log "Unknown" for a non-Error throw', async () => {
        createOrder.mockRejectedValue('boom');

        expect((await callPOST(validAddress)).status).toBe(500);
        expect(logger.error).toHaveBeenCalledWith(
          'POST /api/orders failed',
          expect.objectContaining({ error: 'Unknown' })
        );
      });

      it('should return 500 and NOT create an order when reading the cart fails', async () => {
        getCart.mockRejectedValue(new Error('cart down'));

        const res = await callPOST(validAddress);

        expect(res.status).toBe(500);
        expect(createOrder).not.toHaveBeenCalled();
      });

      it('should return 500 when the session lookup throws', async () => {
        getSession.mockRejectedValue(new Error('auth down'));

        expect((await callPOST(validAddress)).status).toBe(500);
        expect(createOrder).not.toHaveBeenCalled();
      });

      it('should return 500 for an invalid JSON body (see notes: should be 400)', async () => {
        const res = await callPOSTRaw('{not json');

        expect(res.status).toBe(500);
        expect(createOrder).not.toHaveBeenCalled();
      });
    });
  });

  // ═════════════════════════════════════════════════════
  // GET
  // ═════════════════════════════════════════════════════
  describe('GET', () => {
    it.each([[null], [{ user: null }]])('should return 401 for session %j', async session => {
      getSession.mockResolvedValue(session);

      const res = await GET();

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
      expect(getOrders).not.toHaveBeenCalled();
    });

    it('should log a warning when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      await GET();

      expect(logger.warn).toHaveBeenCalledWith('GET /api/orders - Unauthorized', {
        duration: expect.any(Number),
      });
    });

    it('should fetch only the orders of the SESSION user', async () => {
      await GET();

      expect(getOrders).toHaveBeenCalledTimes(1);
      expect(getOrders).toHaveBeenCalledWith('user-1');
    });

    it('should return the orders wrapped in { orders }', async () => {
      const orders = [{ id: 'o1' }, { id: 'o2' }];
      getOrders.mockResolvedValue(orders as any);

      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ orders });
    });

    it('should return an empty list when the user has no orders', async () => {
      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ orders: [] });
    });

    it('should log success with userId and count', async () => {
      getOrders.mockResolvedValue([{ id: 'a' }, { id: 'b' }] as any);

      await GET();

      expect(logger.info).toHaveBeenCalledWith('GET /api/orders succeeded', {
        userId: 'user-1',
        count: 2,
        duration: expect.any(Number),
      });
    });

    it('should return a generic 500 and NOT leak the error message', async () => {
      getOrders.mockRejectedValue(new Error('connection to db-prod-01 refused'));

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body).toEqual({ error: 'Server error' });
      expect(JSON.stringify(body)).not.toContain('db-prod-01');
      expect(logger.error).toHaveBeenCalledWith('GET /api/orders failed', {
        error: 'connection to db-prod-01 refused',
        duration: expect.any(Number),
      });
    });

    it('should log "Unknown" for a non-Error throw', async () => {
      getOrders.mockRejectedValue('boom');

      await GET();

      expect(logger.error).toHaveBeenCalledWith(
        'GET /api/orders failed',
        expect.objectContaining({ error: 'Unknown' })
      );
    });

    it('should return 500 when the session lookup throws', async () => {
      getSession.mockRejectedValue(new Error('auth down'));

      expect((await GET()).status).toBe(500);
      expect(getOrders).not.toHaveBeenCalled();
    });
  });
});
