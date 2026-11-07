// features/brands/schemas/brand.test.ts
import { describe, it, expect } from 'vitest';

import { createBrandSchema, editBrandSchema } from './brand';

const LOGO = 'https://example.com/logo.png';

const issuesOf = (result: { success: boolean; error?: { issues: any[] } }) =>
  result.success ? [] : result.error!.issues;

// ═════════════════════════════════════════════════════
// createBrandSchema
// ═════════════════════════════════════════════════════
describe('createBrandSchema', () => {
  describe('payload معتبر', () => {
    it('should accept a minimal payload and default isActive to true', () => {
      const result = createBrandSchema.safeParse({ name: 'Apple' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({ name: 'Apple', isActive: true });
      }
    });

    it('should accept a full payload', () => {
      const result = createBrandSchema.safeParse({ name: 'Apple', logo: LOGO, isActive: false });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'Apple', logo: LOGO, isActive: false });
      }
    });

    it('should strip unknown fields', () => {
      const result = createBrandSchema.safeParse({
        name: 'Apple',
        slug: 'evil',
        id: 'x',
        role: 'ADMIN',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('slug');
        expect(result.data).not.toHaveProperty('id');
        expect(result.data).not.toHaveProperty('role');
      }
    });
  });

  describe('name', () => {
    it('should reject when missing', () => {
      expect(createBrandSchema.safeParse({}).success).toBe(false);
    });

    it('should reject an empty string with the custom message', () => {
      const issues = issuesOf(createBrandSchema.safeParse({ name: '' }));

      expect(issues[0].path[0]).toBe('name');
      expect(issues[0].message).toBe('نام برند الزامی است');
    });

    it('should reject a name shorter than 2 characters', () => {
      const issues = issuesOf(createBrandSchema.safeParse({ name: 'a' }));

      expect(issues[0].path[0]).toBe('name');
      expect(issues[0].message).toBe('نام برند الزامی است');
    });

    it('should accept a name of exactly 2 characters', () => {
      expect(createBrandSchema.safeParse({ name: 'LG' }).success).toBe(true);
    });

    it('should accept a name of exactly 100 characters', () => {
      expect(createBrandSchema.safeParse({ name: 'a'.repeat(100) }).success).toBe(true);
    });

    it('should reject a name longer than 100 characters', () => {
      const issues = issuesOf(createBrandSchema.safeParse({ name: 'a'.repeat(101) }));

      expect(issues[0].path[0]).toBe('name');
    });

    it('should accept Persian names', () => {
      expect(createBrandSchema.safeParse({ name: 'سامسونگ' }).success).toBe(true);
    });

    it.each([null, 123, true, ['Apple'], {}])('should reject a non-string name (%j)', name => {
      expect(createBrandSchema.safeParse({ name }).success).toBe(false);
    });

    it('should NOT trim: a whitespace-only name of 2+ characters is accepted (see notes)', () => {
      const result = createBrandSchema.safeParse({ name: '   ' });

      expect(result.success).toBe(true);
    });

    it('should NOT trim the stored value (see notes)', () => {
      const result = createBrandSchema.safeParse({ name: '  Apple  ' });

      expect(result.success && result.data.name).toBe('  Apple  ');
    });
  });

  describe('logo', () => {
    it('should be optional', () => {
      const result = createBrandSchema.safeParse({ name: 'Apple' });

      expect(result.success).toBe(true);
      if (result.success) expect(result.data.logo).toBeUndefined();
    });

    it.each(['https://example.com/a.png', 'http://example.com/a.png', 'https://a.co/x?y=1#z'])(
      'should accept the URL %s',
      logo => {
        const result = createBrandSchema.safeParse({ name: 'Apple', logo });

        expect(result.success).toBe(true);
        if (result.success) expect(result.data.logo).toBe(logo);
      }
    );

    it.each(['not-a-url', 'example.com/logo.png', 'abc', 'http://', ' '])(
      'should reject the invalid URL %j with the custom message',
      logo => {
        const issues = issuesOf(createBrandSchema.safeParse({ name: 'Apple', logo }));

        expect(issues[0].path[0]).toBe('logo');
        expect(issues[0].message).toBe('آدرس لوگو معتبر نیست');
      }
    );

    it('should treat an empty string as "no logo" and convert it to undefined', () => {
      const result = createBrandSchema.safeParse({ name: 'Apple', logo: '' });

      expect(result.success).toBe(true);
      if (result.success) expect(result.data.logo).toBeUndefined();
    });

    it('should reject a relative path such as /uploads/x.png (see notes)', () => {
      expect(createBrandSchema.safeParse({ name: 'Apple', logo: '/uploads/x.png' }).success).toBe(
        false
      );
    });

    it.each([null, 123, true, {}])('should reject a non-string logo (%j)', logo => {
      expect(createBrandSchema.safeParse({ name: 'Apple', logo }).success).toBe(false);
    });

    it.todo('should reject non-http(s) protocols such as javascript: and data: (see notes)');
  });

  describe('isActive', () => {
    it('should default to true when missing', () => {
      const result = createBrandSchema.safeParse({ name: 'Apple' });

      expect(result.success && result.data.isActive).toBe(true);
    });

    it('should default to true when explicitly undefined', () => {
      const result = createBrandSchema.safeParse({ name: 'Apple', isActive: undefined });

      expect(result.success && result.data.isActive).toBe(true);
    });

    it.each([true, false])('should keep isActive = %s', isActive => {
      const result = createBrandSchema.safeParse({ name: 'Apple', isActive });

      expect(result.success && result.data.isActive).toBe(isActive);
    });

    it.each(['true', 'false', 1, 0, null])(
      'should reject a non-boolean isActive (%j)',
      isActive => {
        expect(createBrandSchema.safeParse({ name: 'Apple', isActive }).success).toBe(false);
      }
    );
  });

  describe('چند خطا همزمان', () => {
    it('should report all invalid fields at once', () => {
      const issues = issuesOf(
        createBrandSchema.safeParse({ name: 'a', logo: 'bad', isActive: 'yes' })
      );

      expect(issues.map(i => i.path[0])).toEqual(
        expect.arrayContaining(['name', 'logo', 'isActive'])
      );
    });
  });

  describe('ورودی غیرآبجکت', () => {
    it.each([null, undefined, 'text', 123, []])('should reject %j', input => {
      expect(createBrandSchema.safeParse(input).success).toBe(false);
    });
  });
});

// ═════════════════════════════════════════════════════
// editBrandSchema
// ═════════════════════════════════════════════════════
describe('editBrandSchema', () => {
  describe('payload معتبر', () => {
    it('should accept a full payload', () => {
      const result = editBrandSchema.safeParse({ name: 'Apple', logo: LOGO, isActive: false });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'Apple', logo: LOGO, isActive: false });
      }
    });

    it('should accept each field on its own', () => {
      expect(editBrandSchema.safeParse({ name: 'Apple' }).success).toBe(true);
      expect(editBrandSchema.safeParse({ logo: LOGO }).success).toBe(true);
      expect(editBrandSchema.safeParse({ isActive: false }).success).toBe(true);
    });

    it('should accept an empty object (nothing to update, see notes)', () => {
      const result = editBrandSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual({});
    });

    it('should strip unknown fields', () => {
      const result = editBrandSchema.safeParse({ name: 'Apple', slug: 'evil', id: 'x' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'Apple' });
      }
    });
  });

  describe('name', () => {
    it('should be optional', () => {
      expect(editBrandSchema.safeParse({ isActive: true }).success).toBe(true);
    });

    it('should accept an explicit undefined name', () => {
      expect(editBrandSchema.safeParse({ name: undefined }).success).toBe(true);
    });

    it('should reject an empty name (it is not "missing")', () => {
      const issues = issuesOf(editBrandSchema.safeParse({ name: '' }));

      expect(issues[0].path[0]).toBe('name');
      expect(issues[0].message).toBe('نام برند الزامی است');
    });

    it('should reject a 1-character name', () => {
      expect(editBrandSchema.safeParse({ name: 'a' }).success).toBe(false);
    });

    it('should accept 2 and 100 characters but reject 101', () => {
      expect(editBrandSchema.safeParse({ name: 'LG' }).success).toBe(true);
      expect(editBrandSchema.safeParse({ name: 'a'.repeat(100) }).success).toBe(true);
      expect(editBrandSchema.safeParse({ name: 'a'.repeat(101) }).success).toBe(false);
    });

    it('should reject null', () => {
      expect(editBrandSchema.safeParse({ name: null }).success).toBe(false);
    });
  });

  describe('logo', () => {
    it('should accept null (clears the logo)', () => {
      const result = editBrandSchema.safeParse({ logo: null });

      expect(result.success).toBe(true);
      if (result.success) expect(result.data.logo).toBeNull();
    });

    it('should keep null and undefined distinct', () => {
      const missing = editBrandSchema.safeParse({});
      const cleared = editBrandSchema.safeParse({ logo: null });

      expect(missing.success && 'logo' in missing.data).toBe(false);
      expect(cleared.success && 'logo' in cleared.data).toBe(true);
    });

    it('should accept an empty string (the form converts it before sending)', () => {
      expect(editBrandSchema.safeParse({ logo: '' }).success).toBe(true);
    });

    it('should accept a valid URL', () => {
      const result = editBrandSchema.safeParse({ logo: LOGO });

      expect(result.success && result.data.logo).toBe(LOGO);
    });

    it.each(['not-a-url', 'example.com/a.png', '/uploads/x.png'])(
      'should reject the invalid URL %j with the custom message',
      logo => {
        const issues = issuesOf(editBrandSchema.safeParse({ logo }));

        expect(issues[0].path[0]).toBe('logo');
        expect(issues[0].message).toBe('آدرس لوگو معتبر نیست');
      }
    );

    it.each([123, true, {}])('should reject a non-string logo (%j)', logo => {
      expect(editBrandSchema.safeParse({ logo }).success).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should NOT default to true (a missing value must not reactivate a brand)', () => {
      const result = editBrandSchema.safeParse({ name: 'Apple' });

      expect(result.success).toBe(true);
      if (result.success) expect(result.data).not.toHaveProperty('isActive');
    });

    it.each([true, false])('should keep isActive = %s', isActive => {
      const result = editBrandSchema.safeParse({ isActive });

      expect(result.success && result.data.isActive).toBe(isActive);
    });

    it.each(['true', 1, null])('should reject a non-boolean isActive (%j)', isActive => {
      expect(editBrandSchema.safeParse({ isActive }).success).toBe(false);
    });
  });

  describe('ورودی غیرآبجکت', () => {
    it.each([null, undefined, 'text', 123, []])('should reject %j', input => {
      expect(editBrandSchema.safeParse(input).success).toBe(false);
    });
  });
});
