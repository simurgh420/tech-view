// tests/unit/actions/isValidEmailDomain.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('dns/promises', () => ({
  default: {
    resolveMx: vi.fn(),
  },
}));

import dns from 'dns/promises';
import { isValidEmailDomain } from './isValidEmailDomain';

describe('isValidEmailDomain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ورودی نامعتبر', () => {
    it('should return false when email has no @', async () => {
      expect(await isValidEmailDomain('invalid-email')).toBe(false);
      expect(dns.resolveMx).not.toHaveBeenCalled();
    });

    it('should return false when domain part is empty', async () => {
      expect(await isValidEmailDomain('user@')).toBe(false);
      expect(dns.resolveMx).not.toHaveBeenCalled();
    });

    it('should return false for empty string', async () => {
      expect(await isValidEmailDomain('')).toBe(false);
      expect(dns.resolveMx).not.toHaveBeenCalled();
    });
  });

  describe('رکورد MX', () => {
    it('should return true when MX records exist', async () => {
      vi.mocked(dns.resolveMx).mockResolvedValue([
        { exchange: 'mail.example.com', priority: 10 },
      ]);

      expect(await isValidEmailDomain('user@example.com')).toBe(true);
      expect(dns.resolveMx).toHaveBeenCalledWith('example.com');
    });

    it('should return false when MX records are empty', async () => {
      vi.mocked(dns.resolveMx).mockResolvedValue([]);

      expect(await isValidEmailDomain('user@example.com')).toBe(false);
    });

    it('should lowercase the domain before lookup', async () => {
      vi.mocked(dns.resolveMx).mockResolvedValue([
        { exchange: 'mail.example.com', priority: 10 },
      ]);

      await isValidEmailDomain('User@EXAMPLE.COM');

      expect(dns.resolveMx).toHaveBeenCalledWith('example.com');
    });
  });

  describe('خطاها', () => {
    it('should return false when DNS lookup fails (ENOTFOUND)', async () => {
      vi.mocked(dns.resolveMx).mockRejectedValue(
        Object.assign(new Error('queryMx ENOTFOUND'), { code: 'ENOTFOUND' }),
      );

      expect(await isValidEmailDomain('user@nonexistent-domain.xyz')).toBe(false);
    });

    it('should return false when DNS lookup times out after 3 seconds', async () => {
      vi.useFakeTimers();
      // promise ای که هیچ‌وقت resolve نمی‌شود
      vi.mocked(dns.resolveMx).mockReturnValue(new Promise(() => {}));

      const promise = isValidEmailDomain('user@slow-domain.com');
      await vi.advanceTimersByTimeAsync(3000);

      expect(await promise).toBe(false);
    });

    it('should not time out if DNS responds before 3 seconds', async () => {
      vi.useFakeTimers();
      vi.mocked(dns.resolveMx).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ exchange: 'mail.example.com', priority: 10 }]), 1000),
          ),
      );

      const promise = isValidEmailDomain('user@example.com');
      await vi.advanceTimersByTimeAsync(1000);

      expect(await promise).toBe(true);
    });
  });
});
