import { describe, expect, it } from 'vitest';
import { formatAdminDate } from '@/lib/admin-date';

describe('formatAdminDate', () => {
  it('returns a placeholder for empty values', () => {
    expect(formatAdminDate(null)).toBe('—');
  });

  it('formats valid dates into a readable string', () => {
    expect(formatAdminDate('2024-01-01T00:00:00.000Z')).toContain('۱۴');
  });
});
