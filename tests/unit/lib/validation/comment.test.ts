import { describe, it, expect } from 'vitest';
import { createCommentSchema, updateCommentSchema } from '@/lib/validation/comment';

describe('Comment Validation Schemas', () => {
  describe('createCommentSchema', () => {
    const validInput = { content: 'متن مفید و خوب', rating: 4 };

    it('should accept valid input', () => {
      expect(createCommentSchema.safeParse(validInput).success).toBe(true);
    });

    it('should reject content shorter than 3 characters', () => {
      const result = createCommentSchema.safeParse({ content: 'ab', rating: 5 });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('content');
    });

    it('should reject content longer than 1000 characters', () => {
      const longContent = 'a'.repeat(1001);
      const result = createCommentSchema.safeParse({ content: longContent, rating: 5 });
      expect(result.success).toBe(false);
    });

    it('should reject rating less than 1', () => {
      const result = createCommentSchema.safeParse({ content: 'Good', rating: 0 });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('rating');
    });

    it('should reject rating greater than 5', () => {
      const result = createCommentSchema.safeParse({ content: 'Good', rating: 6 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer rating', () => {
      const result = createCommentSchema.safeParse({ content: 'Good', rating: 4.5 });
      expect(result.success).toBe(false);
    });

    it('should reject missing content', () => {
      const result = createCommentSchema.safeParse({ rating: 5 });
      expect(result.success).toBe(false);
    });

    it('should reject missing rating', () => {
      const result = createCommentSchema.safeParse({ content: 'Good' });
      expect(result.success).toBe(false);
    });
  });

  describe('updateCommentSchema', () => {
    it('should allow partial data (only content)', () => {
      expect(updateCommentSchema.safeParse({ content: 'Updated text' }).success).toBe(true);
    });

    it('should allow partial data (only rating)', () => {
      expect(updateCommentSchema.safeParse({ rating: 3 }).success).toBe(true);
    });

    it('should allow empty object (no updates)', () => {
      expect(updateCommentSchema.safeParse({}).success).toBe(true);
    });

    it('should accept valid content and rating together', () => {
      const result = updateCommentSchema.safeParse({ content: 'New text', rating: 2 });
      expect(result.success).toBe(true);
    });

    it('should reject content shorter than 3 characters', () => {
      const result = updateCommentSchema.safeParse({ content: 'ab' });
      expect(result.success).toBe(false);
    });

    it('should reject content longer than 1000 characters', () => {
      const longContent = 'a'.repeat(1001);
      const result = updateCommentSchema.safeParse({ content: longContent });
      expect(result.success).toBe(false);
    });

    it('should reject rating less than 1', () => {
      const result = updateCommentSchema.safeParse({ rating: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject rating greater than 5', () => {
      const result = updateCommentSchema.safeParse({ rating: 6 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer rating', () => {
      const result = updateCommentSchema.safeParse({ rating: 2.7 });
      expect(result.success).toBe(false);
    });
  });
});
