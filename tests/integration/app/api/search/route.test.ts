//tests/unit/api/search/route.test.ts

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dbSearch } from '@/features/search/server/queries';
import { normalizeSearchResults } from '@/features/search/server/searchNormalizer';
import { GET } from '@/app/api/search/route';

vi.mock('@/features/search/server/queries', () => ({
  dbSearch: vi.fn(),
}));

vi.mock('@/features/search/server/searchNormalizer', () => ({
  normalizeSearchResults: vi.fn(),
}));

const mockRawResults = [
  { id: '1', name: 'iPhone 15' },
  { id: '2', name: 'iPhone 16' },
];

const mockNormalizedResults = [
  { id: '1', title: 'iPhone 15' },
  { id: '2', title: 'iPhone 16' },
];

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(dbSearch).mockResolvedValue(
      mockRawResults as never,
    );

    vi.mocked(normalizeSearchResults).mockReturnValue(
      mockNormalizedResults as never,
    );
  });

  describe('Successful search', () => {
    it('should return normalized search results', async () => {
      const request = new Request(
        'http://localhost/api/search?q=iphone',
      );

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockNormalizedResults);

      expect(dbSearch).toHaveBeenCalledWith('iphone');
      expect(normalizeSearchResults).toHaveBeenCalledWith(
        mockRawResults,
      );
    });

    it('should pass an empty string when query parameter is missing', async () => {
      const request = new Request(
        'http://localhost/api/search',
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(dbSearch).toHaveBeenCalledWith('');
    });

    it('should pass an empty string when query parameter is empty', async () => {
      const request = new Request(
        'http://localhost/api/search?q=',
      );

      await GET(request);

      expect(dbSearch).toHaveBeenCalledWith('');
    });
  });

  describe('Database errors', () => {
    it('should propagate error when dbSearch fails', async () => {
      vi.mocked(dbSearch).mockRejectedValueOnce(
        new Error('Database connection failed'),
      );

      const request = new Request(
        'http://localhost/api/search?q=iphone',
      );

      await expect(GET(request)).rejects.toThrow(
        'Database connection failed',
      );

      expect(normalizeSearchResults).not.toHaveBeenCalled();
    });
  });

  describe('Normalizer errors', () => {
    it('should propagate error when normalizeSearchResults fails', async () => {
      vi.mocked(normalizeSearchResults).mockImplementationOnce(
        () => {
          throw new Error('Normalization failed');
        },
      );

      const request = new Request(
        'http://localhost/api/search?q=iphone',
      );

      await expect(GET(request)).rejects.toThrow(
        'Normalization failed',
      );
    });
  });
});
