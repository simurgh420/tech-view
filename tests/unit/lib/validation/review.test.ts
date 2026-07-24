// tests/unit/lib/validation/review.test.ts
import { describe, it, expect } from 'vitest';
import { createReviewSchema, updateReviewSchema } from '@/lib/validation/review';

describe('Review Validation Schemas', () => {
  describe('createReviewSchema', () => {
    const validInput = {
      productSlug: 'test-product', // تغییر از productId به productSlug
      rating: 4,
      content: 'This is a valid review content with more than ten characters.',
    };

    it('should accept valid input', () => {
      expect(createReviewSchema.safeParse(validInput).success).toBe(true);
    });

    it('should accept optional title', () => {
      const withTitle = { ...validInput, title: 'Great product' };
      expect(createReviewSchema.safeParse(withTitle).success).toBe(true);
    });

    it('should reject missing productSlug', () => {
      const input = { ...validInput, productSlug: undefined };
      const result = createReviewSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('productSlug');
    });

    it('should reject empty productSlug', () => {
      const input = { ...validInput, productSlug: '' };
      const result = createReviewSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject rating less than 1', () => {
      const input = { ...validInput, rating: 0 };
      const result = createReviewSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject rating greater than 5', () => {
      const input = { ...validInput, rating: 6 };
      const result = createReviewSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer rating', () => {
      const input = { ...validInput, rating: 4.5 };
      const result = createReviewSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject content shorter than 10 characters', () => {
      const input = { ...validInput, content: 'short' };
      const result = createReviewSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('content');
    });

    it('should reject missing content', () => {
      const input = { ...validInput, content: undefined };
      const result = createReviewSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('updateReviewSchema', () => {
    it('should NOT allow empty object', () => {
      const result = updateReviewSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should allow partial data (only rating)', () => {
      expect(updateReviewSchema.safeParse({ rating: 3 }).success).toBe(true);
    });

    it('should allow partial data (only content)', () => {
      expect(
        updateReviewSchema.safeParse({ content: 'Valid content with enough length' }).success
      ).toBe(true);
    });

    it('should allow partial data (only title)', () => {
      expect(updateReviewSchema.safeParse({ title: 'New title' }).success).toBe(true);
    });

    it('should reject rating less than 1', () => {
      const result = updateReviewSchema.safeParse({ rating: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject rating greater than 5', () => {
      const result = updateReviewSchema.safeParse({ rating: 6 });
      expect(result.success).toBe(false);
    });

    it('should reject rating non-integer', () => {
      const result = updateReviewSchema.safeParse({ rating: 3.7 });
      expect(result.success).toBe(false);
    });

    it('should reject content shorter than 10 characters', () => {
      const result = updateReviewSchema.safeParse({ content: 'short' });
      expect(result.success).toBe(false);
    });

    it('should accept valid content with length >= 10', () => {
      const result = updateReviewSchema.safeParse({ content: 'This is long enough' });
      expect(result.success).toBe(true);
    });
  });
});
