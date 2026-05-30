import { contactSchema } from '@/lib/validation/contact';
import { describe, it, expect } from 'vitest';

describe('Contact Validation Schema', () => {
  const validInput = {
    name: 'رضا حسینی',
    email: 'reza@example.com',
    phone: '09123456789',
    subject: 'مشکل فنی',
    message: 'توضیحات کامل مشکل من...',
  };

  describe('create (valid input)', () => {
    it('should accept valid input', () => {
      expect(contactSchema.safeParse(validInput).success).toBe(true);
    });
  });

  describe('name field', () => {
    it('should reject name shorter than 3 characters', () => {
      const input = { ...validInput, name: 'رض' };
      const result = contactSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('name');
    });

    it('should accept name with 3 or more characters', () => {
      const input = { ...validInput, name: 'رضا' };
      expect(contactSchema.safeParse(input).success).toBe(true);
    });
  });

  describe('email field', () => {
    it('should reject invalid email format', () => {
      const input = { ...validInput, email: 'not-an-email' };
      const result = contactSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('email');
    });

    it('should accept valid email', () => {
      const input = { ...validInput, email: 'test@domain.com' };
      expect(contactSchema.safeParse(input).success).toBe(true);
    });
  });

  describe('phone field', () => {
    it('should reject phone shorter than 10 characters', () => {
      const input = { ...validInput, phone: '09123' };
      const result = contactSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('phone');
    });

    it('should accept phone with 10 or more characters', () => {
      const input = { ...validInput, phone: '09123456789' };
      expect(contactSchema.safeParse(input).success).toBe(true);
    });
  });

  describe('subject field', () => {
    it('should reject subject shorter than 3 characters', () => {
      const input = { ...validInput, subject: 'مش' };
      const result = contactSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('subject');
    });

    it('should accept subject with 3 or more characters', () => {
      const input = { ...validInput, subject: 'مشکل' };
      expect(contactSchema.safeParse(input).success).toBe(true);
    });
  });

  describe('message field', () => {
    it('should reject message shorter than 10 characters', () => {
      const input = { ...validInput, message: 'کوتاه' };
      const result = contactSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('message');
    });

    it('should accept message with 10 or more characters', () => {
      const input = { ...validInput, message: 'این یک پیام ده کاراکتری است' };
      expect(contactSchema.safeParse(input).success).toBe(true);
    });
  });

  describe('missing fields', () => {
    const requiredFields = ['name', 'email', 'phone', 'subject', 'message'];

    requiredFields.forEach(field => {
      it(`should reject missing ${field}`, () => {
        const input = { ...validInput };
        delete (input as any)[field];
        const result = contactSchema.safeParse(input);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toContain(field);
      });
    });
  });
});
