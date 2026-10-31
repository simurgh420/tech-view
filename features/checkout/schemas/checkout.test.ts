// features/checkout/schemas/checkout.test.ts
import { describe, it, expect } from 'vitest';

import { checkoutSchema, type CheckoutPayloadType } from './checkout';

const validPayload: CheckoutPayloadType = {
  fullName: 'علی رضایی',
  phone: '09123456789',
  city: 'تهران',
  postalCode: '1234567890',
  address: 'تهران، خیابان ولیعصر، پلاک 10',
};

/** مسیر فیلد و پیام خطا را از اولین issue بیرون می‌کشد */
const getFirstIssue = (data: unknown) => {
  const result = checkoutSchema.safeParse(data);
  if (result.success) return null;
  const issue = result.error.issues[0];
  return { path: issue.path[0], message: issue.message };
};

describe('checkoutSchema', () => {
  describe('payload معتبر', () => {
    it('should accept a valid payload', () => {
      const result = checkoutSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validPayload);
      }
    });

    it('should strip unknown fields', () => {
      const result = checkoutSchema.safeParse({ ...validPayload, hacker: 'x' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('hacker');
      }
    });
  });

  describe('فیلدهای الزامی', () => {
    it.each(['fullName', 'phone', 'city', 'postalCode', 'address'] as const)(
      'should reject when %s is missing',
      field => {
        const payload: Partial<CheckoutPayloadType> = { ...validPayload };
        delete payload[field];

        const result = checkoutSchema.safeParse(payload);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.path[0] === field)).toBe(true);
        }
      }
    );

    it('should reject non-string values', () => {
      expect(checkoutSchema.safeParse({ ...validPayload, phone: 9123456789 }).success).toBe(false);
      expect(checkoutSchema.safeParse({ ...validPayload, city: null }).success).toBe(false);
    });

    it('should reject an empty object', () => {
      expect(checkoutSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('fullName', () => {
    it('should reject names shorter than 3 characters', () => {
      expect(getFirstIssue({ ...validPayload, fullName: 'ab' })).toEqual({
        path: 'fullName',
        message: 'نام معتبر نیست',
      });
    });

    it('should accept a name of exactly 3 characters', () => {
      expect(checkoutSchema.safeParse({ ...validPayload, fullName: 'علی' }).success).toBe(true);
    });
  });

  describe('phone', () => {
    it('should reject phone shorter than 11 characters', () => {
      expect(getFirstIssue({ ...validPayload, phone: '0912345678' })).toEqual({
        path: 'phone',
        message: 'شماره موبایل معتبر نیست',
      });
    });

    it('should accept phone of exactly 11 characters', () => {
      expect(checkoutSchema.safeParse({ ...validPayload, phone: '09123456789' }).success).toBe(
        true
      );
    });
  });

  describe('city', () => {
    it('should reject city shorter than 2 characters', () => {
      expect(getFirstIssue({ ...validPayload, city: 'ت' })).toEqual({
        path: 'city',
        message: 'شهر معتبر نیست',
      });
    });

    it('should accept city of exactly 2 characters', () => {
      expect(checkoutSchema.safeParse({ ...validPayload, city: 'قم' }).success).toBe(true);
    });
  });

  describe('postalCode', () => {
    it('should reject postal code shorter than 5 characters', () => {
      expect(getFirstIssue({ ...validPayload, postalCode: '1234' })).toEqual({
        path: 'postalCode',
        message: 'کد پستی معتبر نیست',
      });
    });

    it('should accept postal code of exactly 5 characters', () => {
      expect(checkoutSchema.safeParse({ ...validPayload, postalCode: '12345' }).success).toBe(true);
    });
  });

  describe('address', () => {
    it('should reject address shorter than 10 characters', () => {
      expect(getFirstIssue({ ...validPayload, address: 'کوتاه' })).toEqual({
        path: 'address',
        message: 'آدرس باید کامل باشد',
      });
    });

    it('should accept address of exactly 10 characters', () => {
      expect(checkoutSchema.safeParse({ ...validPayload, address: '1234567890' }).success).toBe(
        true
      );
    });
  });

  describe('چند خطا همزمان', () => {
    it('should report all invalid fields at once', () => {
      const result = checkoutSchema.safeParse({
        fullName: 'a',
        phone: '1',
        city: 'b',
        postalCode: '1',
        address: 'c',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path[0]);
        expect(paths).toEqual(
          expect.arrayContaining(['fullName', 'phone', 'city', 'postalCode', 'address'])
        );
        expect(result.error.issues).toHaveLength(5);
      }
    });
  });
});
