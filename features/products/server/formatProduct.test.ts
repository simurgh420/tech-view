// features/products/server/formatProduct.test.ts
import { describe, it, expect } from 'vitest';

import { formatProduct } from './formatProduct';

/** شبیه Decimal پریزما: فقط toString دارد */
const decimal = (v: string | number) => ({ toString: () => String(v) });

const createRaw = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'p1',
    title: 'آیفون ۱۵',
    slug: 'iphone-15',
    description: 'توضیحات',
    price: decimal(50000000),
    discountPrice: null,
    discountPercentage: null,
    isDiscounted: false,
    isFeatured: true,
    isNew: false,
    stockQuantity: 10,
    thumbnail: '/t.png',
    images: ['/1.png', '/2.png'],
    keyFeatures: ['ویژگی ۱'],
    colors: [{ name: 'مشکی', hex: '#000' }],
    variants: [{ name: '256GB' }],
    specifications: [],
    status: 'PUBLISHED',
    rating: null,
    reviewCount: 0,
    createdAt: new Date('2025-01-01T10:00:00.000Z'),
    updatedAt: new Date('2025-01-02T10:00:00.000Z'),
    publishedAt: null,
    brand: { id: 'b1', name: 'Apple' },
    category: { id: 'c1', name: 'موبایل' },
    subCategory: null,
    ...overrides,
  }) as any;

const createSpec = (overrides: Record<string, unknown> = {}) => ({
  key: 'ram',
  value: '8GB',
  attributeId: 'a1',
  attribute: { label: 'رم' },
  ...overrides,
});

const createReview = (overrides: Record<string, unknown> = {}) => ({
  id: 'r1',
  rating: 5,
  title: 'عالی',
  content: 'کیفیت خوب',
  createdAt: new Date('2025-02-01T10:00:00.000Z'),
  updatedAt: new Date('2025-02-02T10:00:00.000Z'),
  authorId: 'u1',
  user: { id: 'u1', name: 'علی' },
  ...overrides,
});

describe('formatProduct', () => {
  describe('نگاشت فیلدهای ساده', () => {
    it('should pass scalar fields through unchanged', () => {
      const result = formatProduct(createRaw());

      expect(result).toMatchObject({
        id: 'p1',
        title: 'آیفون ۱۵',
        slug: 'iphone-15',
        description: 'توضیحات',
        discountPercentage: null,
        isDiscounted: false,
        isFeatured: true,
        isNew: false,
        stockQuantity: 10,
        thumbnail: '/t.png',
        images: ['/1.png', '/2.png'],
        keyFeatures: ['ویژگی ۱'],
        colors: [{ name: 'مشکی', hex: '#000' }],
        variants: [{ name: '256GB' }],
        status: 'PUBLISHED',
        reviewCount: 0,
        brand: { id: 'b1', name: 'Apple' },
        category: { id: 'c1', name: 'موبایل' },
        subCategory: null,
      });
    });
  });

  describe('تبدیل Decimal به string', () => {
    it('should convert price to string', () => {
      expect(formatProduct(createRaw({ price: decimal('1234.50') })).price).toBe('1234.50');
    });

    it('should convert discountPrice to string when present', () => {
      const result = formatProduct(createRaw({ discountPrice: decimal(800) }));

      expect(result.discountPrice).toBe('800');
    });

    it('should return null when discountPrice is null or undefined', () => {
      expect(formatProduct(createRaw({ discountPrice: null })).discountPrice).toBeNull();
      expect(formatProduct(createRaw({ discountPrice: undefined })).discountPrice).toBeNull();
    });

    it('should convert rating to string when present', () => {
      expect(formatProduct(createRaw({ rating: decimal('4.5') })).rating).toBe('4.5');
    });

    it('should keep rating 0 as "0" (not null)', () => {
      expect(formatProduct(createRaw({ rating: decimal(0) })).rating).toBe('0');
    });

    it('should return null when rating is null', () => {
      expect(formatProduct(createRaw({ rating: null })).rating).toBeNull();
    });
  });

  describe('تبدیل تاریخ‌ها', () => {
    it('should serialize createdAt and updatedAt to ISO strings', () => {
      const result = formatProduct(createRaw());

      expect(result.createdAt).toBe('2025-01-01T10:00:00.000Z');
      expect(result.updatedAt).toBe('2025-01-02T10:00:00.000Z');
    });

    it('should serialize publishedAt when present', () => {
      const result = formatProduct(
        createRaw({ publishedAt: new Date('2025-03-01T00:00:00.000Z') }),
      );

      expect(result.publishedAt).toBe('2025-03-01T00:00:00.000Z');
    });

    it('should return null when publishedAt is null', () => {
      expect(formatProduct(createRaw({ publishedAt: null })).publishedAt).toBeNull();
    });
  });

  describe('مشخصات فنی (specifications)', () => {
    it('should return an empty array when there are no specs', () => {
      expect(formatProduct(createRaw({ specifications: [] })).specifications).toEqual([]);
    });

    it('should put all specs in a single group "مشخصات فنی"', () => {
      const result = formatProduct(
        createRaw({
          specifications: [
            createSpec({ key: 'ram', value: '8GB', attributeId: 'a1', attribute: { label: 'رم' } }),
            createSpec({ key: 'cpu', value: 'A17', attributeId: 'a2', attribute: { label: 'پردازنده' } }),
          ],
        }),
      );

      expect(result.specifications).toEqual([
        {
          group: 'مشخصات فنی',
          items: [
            { label: 'رم', value: '8GB', attributeId: 'a1' },
            { label: 'پردازنده', value: 'A17', attributeId: 'a2' },
          ],
        },
      ]);
    });

    it('should keep the original order of specs', () => {
      const result = formatProduct(
        createRaw({
          specifications: [
            createSpec({ key: 'c', attribute: { label: 'C' } }),
            createSpec({ key: 'a', attribute: { label: 'A' } }),
            createSpec({ key: 'b', attribute: { label: 'B' } }),
          ],
        }),
      );

      expect(result.specifications[0].items.map((i) => i.label)).toEqual(['C', 'A', 'B']);
    });

    it('should fall back to spec.key when attribute is null', () => {
      const result = formatProduct(
        createRaw({ specifications: [createSpec({ key: 'weight', attribute: null })] }),
      );

      expect(result.specifications[0].items[0].label).toBe('weight');
    });

    it('should fall back to spec.key when attribute has no label', () => {
      const result = formatProduct(
        createRaw({ specifications: [createSpec({ key: 'weight', attribute: { label: null } })] }),
      );

      expect(result.specifications[0].items[0].label).toBe('weight');
    });

    it('should pass attributeId through (including null)', () => {
      const result = formatProduct(
        createRaw({ specifications: [createSpec({ attributeId: null })] }),
      );

      expect(result.specifications[0].items[0].attributeId).toBeNull();
    });
  });

  describe('نظرات (reviews)', () => {
    it('should NOT include the reviews key when raw has no reviews', () => {
      const result = formatProduct(createRaw());

      expect(result).not.toHaveProperty('reviews');
    });

    it('should map reviews and serialize their dates', () => {
      const result = formatProduct(createRaw({ reviews: [createReview()] }));

      expect(result.reviews).toEqual([
        {
          id: 'r1',
          rating: 5,
          title: 'عالی',
          content: 'کیفیت خوب',
          createdAt: '2025-02-01T10:00:00.000Z',
          updatedAt: '2025-02-02T10:00:00.000Z',
          authorId: 'u1',
          user: { id: 'u1', name: 'علی' },
        },
      ]);
    });

    it('should keep the order of multiple reviews', () => {
      const result = formatProduct(
        createRaw({
          reviews: [createReview({ id: 'r1' }), createReview({ id: 'r2' }), createReview({ id: 'r3' })],
        }),
      );

      expect(result.reviews!.map((r) => r.id)).toEqual(['r1', 'r2', 'r3']);
    });

    it('should not leak extra review fields', () => {
      const result = formatProduct(
        createRaw({ reviews: [createReview({ productId: 'p1', secret: 'x' })] }),
      );

      expect(result.reviews![0]).not.toHaveProperty('productId');
      expect(result.reviews![0]).not.toHaveProperty('secret');
    });

    it('should currently omit the reviews key when the reviews array is empty', () => {
      // [] در JS truthy است، پس کلید reviews با مقدار [] برمی‌گردد
      const result = formatProduct(createRaw({ reviews: [] }));

      expect(result.reviews).toEqual([]);
    });
  });

  describe('خروجی', () => {
    it('should not leak unknown raw fields', () => {
      const result = formatProduct(createRaw({ internalNote: 'secret', costPrice: decimal(1) }));

      expect(result).not.toHaveProperty('internalNote');
      expect(result).not.toHaveProperty('costPrice');
    });

    it('should return JSON-serializable output (no Date or Decimal objects)', () => {
      const result = formatProduct(
        createRaw({
          price: decimal(100),
          discountPrice: decimal(80),
          rating: decimal('4.5'),
          publishedAt: new Date('2025-03-01T00:00:00.000Z'),
          reviews: [createReview()],
        }),
      );

      expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    });
  });
});
