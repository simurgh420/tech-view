import { describe, it, expect } from 'vitest';
import { createBrandSchema, editBrandSchema } from '@/lib/validation/brand';

describe('Brand Validation Schemas', () => {
  describe('createBrandSchema', () => {
    const validInput = { name: 'برند تست' };

    it('should accept valid input', () => {
      expect(createBrandSchema.safeParse(validInput).success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = createBrandSchema.safeParse({ name: 'ا' });
      expect(result.success).toBe(false);
    });

    it('should accept optional logo and isActive', () => {
      const input = {
        name: 'برند با لوگو',
        logo: 'https://example.com/logo.png',
        isActive: false,
      };
      expect(createBrandSchema.safeParse(input).success).toBe(true);
    });

    it('should set default isActive to true when not provided', () => {
      const result = createBrandSchema.parse({ name: 'برند تست' });
      expect(result.isActive).toBe(true);
    });
  });

  describe('editBrandSchema', () => {
    it('should allow partial data', () => {
      expect(editBrandSchema.safeParse({ name: 'نام جدید' }).success).toBe(true);
    });

    it('should accept null for logo', () => {
      const result = editBrandSchema.safeParse({ logo: null });
      expect(result.success).toBe(true);
    });

    it('should accept no fields (empty object)', () => {
      expect(editBrandSchema.safeParse({}).success).toBe(true);
    });

    it('should accept logo as valid URL string', () => {
      const result = editBrandSchema.safeParse({ logo: 'https://example.com/logo.png' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL for logo', () => {
      const result = editBrandSchema.safeParse({ logo: 'not-a-url' });
      expect(result.success).toBe(false);
    });
  });
});
