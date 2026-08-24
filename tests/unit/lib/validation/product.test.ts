import { describe, it, expect } from 'vitest';
import {
  productFormSchema,
  createProductPayloadSchema,
  createProductSchema,
  updateProductSchema,
} from '@/lib/validation/product';

describe('Product Validation Schemas', () => {
  // ---------- productFormSchema (Client Form) ----------
  describe('productFormSchema', () => {
    const validInput = {
      title: 'محصول تست',
      description: 'توضیحات بلند برای محصول',
      price: 150000,
      brandSlug: 'brand-1',
      categorySlug: 'cat-1',
      stockQuantity: 10,
    };

    it('should accept valid input', () => {
      expect(productFormSchema.safeParse(validInput).success).toBe(true);
    });

    it('should accept optional fields', () => {
      const withOptional = {
        ...validInput,

        discountPrice: 120000,

        thumbnail: new File([''], 'test.jpg'),

        images: [new File([''], 'img1.jpg'), 'https://example.com/img2.jpg'],

        keyFeatures: ['کیفیت بالا', 'طراحی زیبا'],

        colors: [
          {
            name: 'قرمز',
            hex: '#FF0000',
          },
        ],

        variants: [
          {
            ram: '8GB',
            storage: '256GB',
          },
        ],

        specifications: [
          {
            attributeId: 'processor-model',
            value: 'Intel',
          },
          {
            attributeId: 'processor-brand',
            value: 'Intel',
          },
        ],

        isFeatured: true,
        isNew: false,
        status: 'PUBLISHED',
      };

      expect(productFormSchema.safeParse(withOptional).success).toBe(true);
    });

    it('should reject invalid thumbnail (neither File nor string)', () => {
      const invalid = { ...validInput, thumbnail: 123 };
      expect(productFormSchema.safeParse(invalid).success).toBe(false);
    });

    // 🆕 تست جدید: قبول مسیر نسبی برای thumbnail
    it('should accept relative path string for thumbnail', () => {
      const input = { ...validInput, thumbnail: '/uploads/test.jpg' };
      expect(productFormSchema.safeParse(input).success).toBe(true);
    });

    // 🆕 تست جدید: قبول مسیر نسبی و URL در images
    it('should accept mixed relative and absolute URLs in images', () => {
      const input = {
        ...validInput,
        images: ['/uploads/img1.jpg', 'https://cdn.example.com/img2.png'],
      };
      expect(productFormSchema.safeParse(input).success).toBe(true);
    });
  });

  // ---------- createProductPayloadSchema ----------
  describe('createProductPayloadSchema', () => {
    const validPayload = {
      title: 'محصول تست',
      description: 'این توضیحات به اندازه کافی بلند است و بیش از بیست کاراکتر دارد.',
      price: 150000,
      brandSlug: 'brand-1',
      categorySlug: 'cat-1',
      stockQuantity: 10,
    };

    it('should accept valid payload', () => {
      expect(createProductPayloadSchema.safeParse(validPayload).success).toBe(true);
    });
    it('should reject thumbnail that is not upload path', () => {
      const input = {
        ...validPayload,
        thumbnail: 'https://example.com/image.jpg',
      };

      expect(createProductPayloadSchema.safeParse(input).success).toBe(false);
    });
    it('should apply default values for optional fields', () => {
      const result = createProductPayloadSchema.parse(validPayload);
      expect(result.stockQuantity).toBe(10);
      expect(result.images).toBeUndefined();
      expect(result.keyFeatures).toEqual([]);
      expect(result.colors).toEqual([]);
      expect(result.variants).toEqual([]);
      expect(result.specifications).toEqual([]);

      expect(result.isFeatured).toBe(false);
      expect(result.isNew).toBe(true);
    });

    it('should reject title shorter than 3', () => {
      const invalid = { ...validPayload, title: 'ab' };
      expect(createProductPayloadSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject description shorter than 20', () => {
      const invalid = { ...validPayload, description: 'short' };
      expect(createProductPayloadSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject negative stockQuantity', () => {
      const invalid = { ...validPayload, stockQuantity: -5 };
      expect(createProductPayloadSchema.safeParse(invalid).success).toBe(false);
    });

    // 🆕 تست جدید: قبول thumbnail به صورت رشته (مسیر نسبی)
    it('should accept thumbnail as a relative path string', () => {
      const input = { ...validPayload, thumbnail: '/uploads/thumb.jpg' };
      expect(createProductPayloadSchema.safeParse(input).success).toBe(true);
    });

    // 🆕 تست جدید: قبول thumbnail به صورت null
    it('should accept thumbnail as null', () => {
      const input = { ...validPayload, thumbnail: null };
      expect(createProductPayloadSchema.safeParse(input).success).toBe(true);
    });
  });

  // ---------- createProductSchema (Server) ----------
  describe('createProductSchema', () => {
    const validInput = {
      title: 'محصول تست',
      description: 'این توضیحات به اندازه کافی بلند است و بیش از بیست کاراکتر دارد.',
      price: 150000,
      brandSlug: 'brand-1',
      categorySlug: 'cat-1',
      stockQuantity: 10,
    };

    it('should accept upload paths', () => {
      const input = {
        ...validInput,
        thumbnail: '/uploads/thumb.jpg',
        images: ['/uploads/img1.jpg', '/uploads/img2.jpg'],
      };

      expect(createProductSchema.safeParse(input).success).toBe(true);
    });

    it('should reject external image urls', () => {
      const input = {
        ...validInput,
        thumbnail: 'https://example.com/thumb.jpg',
      };

      expect(createProductSchema.safeParse(input).success).toBe(false);
    });

    it('should apply defaults', () => {
      const result = createProductSchema.parse(validInput);

      expect(result.images).toBeUndefined();
      expect(result.isFeatured).toBe(false);
      expect(result.isNew).toBe(true);
      expect(result.publishedAt).toBeUndefined();
    });
  });

  // ---------- updateProductSchema ----------
  describe('updateProductSchema', () => {
    it('should allow upload paths', () => {
      const update = {
        thumbnail: '/uploads/thumb.jpg',
        images: ['/uploads/img1.jpg'],
      };

      expect(updateProductSchema.safeParse(update).success).toBe(true);
    });

    it('should reject external thumbnail url', () => {
      const update = {
        thumbnail: 'https://example.com/thumb.jpg',
      };

      expect(updateProductSchema.safeParse(update).success).toBe(false);
    });

    it('should reject external image url', () => {
      const update = {
        images: ['https://example.com/img.jpg'],
      };

      expect(updateProductSchema.safeParse(update).success).toBe(false);
    });

    it('should allow partial update', () => {
      expect(
        updateProductSchema.safeParse({
          title: 'عنوان جدید',
        }).success
      ).toBe(true);
    });

    it('should allow empty object', () => {
      expect(updateProductSchema.safeParse({}).success).toBe(true);
    });
  });
});
