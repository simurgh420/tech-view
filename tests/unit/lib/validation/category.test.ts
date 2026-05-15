import { describe, it, expect } from 'vitest';
import { createCategorySchema, editCategorySchema } from '@/lib/validation/category';

describe('Category Validation Schemas', () => {
  describe('createCategorySchema', () => {
    const validInput = { title: 'الکترونیک' };

    it('should accept valid input', () => {
      expect(createCategorySchema.safeParse(validInput).success).toBe(true);
    });

    it('should reject title shorter than 2 characters', () => {
      const result = createCategorySchema.safeParse({ title: 'ا' });
      expect(result.success).toBe(false);
    });

    it('should reject title longer than 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = createCategorySchema.safeParse({ title: longTitle });
      expect(result.success).toBe(false);
    });

    it('should accept optional icon as string or null', () => {
      expect(
        createCategorySchema.safeParse({ title: 'کالا', icon: 'https://example.com/icon.png' })
          .success
      ).toBe(true);
      expect(createCategorySchema.safeParse({ title: 'کالا', icon: null }).success).toBe(true);
    });

    it('should accept optional parentId as string or null', () => {
      expect(createCategorySchema.safeParse({ title: 'کالا', parentId: 'cat-123' }).success).toBe(
        true
      );
      expect(createCategorySchema.safeParse({ title: 'کالا', parentId: null }).success).toBe(true);
    });

    it('should reject icon if provided as non-string non-null', () => {
      const result = createCategorySchema.safeParse({ title: 'کالا', icon: 123 });
      expect(result.success).toBe(false);
    });
  });

  describe('editCategorySchema', () => {
    it('should allow partial data (only title)', () => {
      expect(editCategorySchema.safeParse({ title: 'جدید' }).success).toBe(true);
    });

    it('should allow empty object (no fields)', () => {
      expect(editCategorySchema.safeParse({}).success).toBe(true);
    });

    it('should accept null for optional fields', () => {
      expect(editCategorySchema.safeParse({ title: 'کالا', icon: null }).success).toBe(true);
      expect(editCategorySchema.safeParse({ title: 'کالا', parentId: null }).success).toBe(true);
    });

    it('should reject title if provided with invalid length', () => {
      const short = editCategorySchema.safeParse({ title: 'ا' });
      expect(short.success).toBe(false);
      const long = editCategorySchema.safeParse({ title: 'a'.repeat(101) });
      expect(long.success).toBe(false);
    });
  });
});
