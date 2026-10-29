// features/product-comments/schemas/productComment.test.ts
import { describe, it, expect } from 'vitest';

import { createProductCommentSchema, updateProductCommentSchema } from './productComment';

// یک cuid معتبر (فرمت: c + ۲۴ کاراکتر حروف کوچک/عدد)
const VALID_CUID = 'cjld2cjxh0000qzrmn831i7rn';

describe('createProductCommentSchema', () => {
  const validPayload = {
    productSlug: 'iphone-15',
    content: 'محصول بسیار خوبی است',
  };

  describe('payload معتبر', () => {
    it('should accept a minimal valid payload', () => {
      const result = createProductCommentSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPayload);
      }
    });

    it('should accept a valid payload with parentId (reply)', () => {
      const result = createProductCommentSchema.safeParse({
        ...validPayload,
        parentId: VALID_CUID,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parentId).toBe(VALID_CUID);
      }
    });

    it('should strip unknown fields', () => {
      const result = createProductCommentSchema.safeParse({ ...validPayload, status: 'APPROVED' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('status');
      }
    });
  });

  describe('productSlug', () => {
    it('should reject when missing', () => {
      const result = createProductCommentSchema.safeParse({ content: validPayload.content });

      expect(result.success).toBe(false);
    });

    it('should reject empty string with the custom message', () => {
      const result = createProductCommentSchema.safeParse({ ...validPayload, productSlug: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('productSlug');
        expect(result.error.issues[0].message).toBe('شناسه محصول الزامی است');
      }
    });

    it('should accept a single character slug', () => {
      expect(
        createProductCommentSchema.safeParse({ ...validPayload, productSlug: 'a' }).success
      ).toBe(true);
    });

    it('should reject non-string values', () => {
      expect(
        createProductCommentSchema.safeParse({ ...validPayload, productSlug: 123 }).success
      ).toBe(false);
    });
  });

  describe('content', () => {
    it('should reject when missing', () => {
      expect(createProductCommentSchema.safeParse({ productSlug: 'x' }).success).toBe(false);
    });

    it('should reject content shorter than 2 characters', () => {
      const result = createProductCommentSchema.safeParse({ ...validPayload, content: 'a' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('content');
        expect(result.error.issues[0].message).toBe('متن کامنت حداقل ۲ کاراکتر');
      }
    });

    it('should accept content of exactly 2 characters', () => {
      expect(createProductCommentSchema.safeParse({ ...validPayload, content: 'ab' }).success).toBe(
        true
      );
    });

    it('should accept content of exactly 1000 characters', () => {
      expect(
        createProductCommentSchema.safeParse({ ...validPayload, content: 'a'.repeat(1000) }).success
      ).toBe(true);
    });

    it('should reject content longer than 1000 characters', () => {
      const result = createProductCommentSchema.safeParse({
        ...validPayload,
        content: 'a'.repeat(1001),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('متن کامنت حداکثر ۱۰۰۰ کاراکتر');
      }
    });

    it('should trim whitespace before validating and return the trimmed value', () => {
      const result = createProductCommentSchema.safeParse({
        ...validPayload,
        content: '   سلام   ',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe('سلام');
      }
    });

    it('should reject whitespace-only content', () => {
      expect(
        createProductCommentSchema.safeParse({ ...validPayload, content: '          ' }).success
      ).toBe(false);
    });

    it('should count length AFTER trim (1 char + spaces is rejected)', () => {
      expect(
        createProductCommentSchema.safeParse({ ...validPayload, content: '  a  ' }).success
      ).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(createProductCommentSchema.safeParse({ ...validPayload, content: 12 }).success).toBe(
        false
      );
    });
  });

  describe('parentId', () => {
    it('should be optional', () => {
      const result = createProductCommentSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parentId).toBeUndefined();
      }
    });

    it('should reject an invalid cuid', () => {
      const result = createProductCommentSchema.safeParse({
        ...validPayload,
        parentId: 'not-a-cuid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('parentId');
      }
    });

    it('should reject an empty string parentId', () => {
      // فرم‌ها گاهی parentId را به‌صورت '' می‌فرستند؛ این تست رفتار فعلی را ثبت می‌کند
      expect(createProductCommentSchema.safeParse({ ...validPayload, parentId: '' }).success).toBe(
        false
      );
    });

    it('should reject null parentId', () => {
      expect(
        createProductCommentSchema.safeParse({ ...validPayload, parentId: null }).success
      ).toBe(false);
    });
  });

  describe('چند خطا همزمان', () => {
    it('should report all invalid fields at once', () => {
      const result = createProductCommentSchema.safeParse({
        productSlug: '',
        content: 'a',
        parentId: 'bad',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0]);
        expect(paths).toEqual(expect.arrayContaining(['productSlug', 'content', 'parentId']));
      }
    });
  });
});

describe('updateProductCommentSchema', () => {
  describe('payload معتبر', () => {
    it('should accept content only', () => {
      const result = updateProductCommentSchema.safeParse({ content: 'متن جدید' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ content: 'متن جدید' });
      }
    });

    it('should accept status only', () => {
      const result = updateProductCommentSchema.safeParse({ status: 'APPROVED' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ status: 'APPROVED' });
      }
    });

    it('should accept both content and status', () => {
      const result = updateProductCommentSchema.safeParse({
        content: 'متن جدید',
        status: 'REJECTED',
      });

      expect(result.success).toBe(true);
    });

    it.each(['PENDING', 'APPROVED', 'REJECTED'])('should accept status %s', status => {
      expect(updateProductCommentSchema.safeParse({ status }).success).toBe(true);
    });
  });

  describe('refine: حداقل یک فیلد', () => {
    it('should reject an empty object with the custom message', () => {
      const result = updateProductCommentSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('حداقل یک فیلد برای بروزرسانی الزامی است');
      }
    });

    it('should reject an object with only unknown fields (stripped to empty)', () => {
      const result = updateProductCommentSchema.safeParse({ hacker: 'x' });

      expect(result.success).toBe(false);
    });

    it('should strip unknown fields when valid fields are present', () => {
      const result = updateProductCommentSchema.safeParse({ content: 'متن جدید', hacker: 'x' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('hacker');
      }
    });
  });

  describe('content', () => {
    it('should reject content shorter than 2 characters', () => {
      expect(updateProductCommentSchema.safeParse({ content: 'a' }).success).toBe(false);
    });

    it('should accept content of exactly 2 and exactly 1000 characters', () => {
      expect(updateProductCommentSchema.safeParse({ content: 'ab' }).success).toBe(true);
      expect(updateProductCommentSchema.safeParse({ content: 'a'.repeat(1000) }).success).toBe(
        true
      );
    });

    it('should reject content longer than 1000 characters', () => {
      expect(updateProductCommentSchema.safeParse({ content: 'a'.repeat(1001) }).success).toBe(
        false
      );
    });

    it('should trim content', () => {
      const result = updateProductCommentSchema.safeParse({ content: '   سلام   ' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe('سلام');
      }
    });

    it('should reject whitespace-only content', () => {
      expect(updateProductCommentSchema.safeParse({ content: '      ' }).success).toBe(false);
    });
  });

  describe('status', () => {
    it('should reject unknown status values', () => {
      expect(updateProductCommentSchema.safeParse({ status: 'DELETED' }).success).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(updateProductCommentSchema.safeParse({ status: 'approved' }).success).toBe(false);
    });

    it('should reject non-string status', () => {
      expect(updateProductCommentSchema.safeParse({ status: 1 }).success).toBe(false);
    });
  });
});
