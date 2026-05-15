import { describe, it, expect } from 'vitest';
import { addCartItemSchema, updateQuantitySchema } from '@/lib/validation/cart';

describe('Cart Validation Schemas', () => {
  describe('addCartItemSchema', () => {
    const validInput = { productId: 'prod-123' };

    it('should accept valid input', () => {
      expect(addCartItemSchema.safeParse(validInput).success).toBe(true);
    });

    it('should reject empty productId', () => {
      const result = addCartItemSchema.safeParse({ productId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('productId');
    });

    it('should reject missing productId', () => {
      const result = addCartItemSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept optional quantity with default 1', () => {
      const result = addCartItemSchema.parse({ productId: '123' });
      expect(result.quantity).toBe(1);
    });

    it('should accept positive integer quantity', () => {
      const result = addCartItemSchema.safeParse({ productId: '123', quantity: 5 });
      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(5);
    });

    it('should reject zero quantity', () => {
      const result = addCartItemSchema.safeParse({ productId: '123', quantity: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity', () => {
      const result = addCartItemSchema.safeParse({ productId: '123', quantity: -3 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer quantity', () => {
      const result = addCartItemSchema.safeParse({ productId: '123', quantity: 2.5 });
      expect(result.success).toBe(false);
    });
  });

  describe('updateQuantitySchema', () => {
    it('should accept valid quantity between 1 and 99', () => {
      const result = updateQuantitySchema.safeParse({ quantity: 5 });
      expect(result.success).toBe(true);
    });

    it('should accept minimum quantity 1', () => {
      const result = updateQuantitySchema.safeParse({ quantity: 1 });
      expect(result.success).toBe(true);
    });

    it('should accept maximum quantity 99', () => {
      const result = updateQuantitySchema.safeParse({ quantity: 99 });
      expect(result.success).toBe(true);
    });

    it('should reject quantity 0', () => {
      const result = updateQuantitySchema.safeParse({ quantity: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject quantity 100', () => {
      const result = updateQuantitySchema.safeParse({ quantity: 100 });
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity', () => {
      const result = updateQuantitySchema.safeParse({ quantity: -5 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer quantity', () => {
      const result = updateQuantitySchema.safeParse({ quantity: 3.5 });
      expect(result.success).toBe(false);
    });

    it('should reject missing quantity', () => {
      const result = updateQuantitySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
