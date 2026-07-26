// tests/unit/hooks/useContact.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Import مستقیم هوک‌ها و contactKeys
import {
  useGetContacts,
  useGetContact,
  useCreateContact,
  useDeleteContact,
  contactKeys,
} from '@/hooks/useContact';

import * as queries from '@/services/contact/api/queries';
import * as mutations from '@/services/contact/api/mutations';

// ─── Mock API ها ──────────────────────────────────────────
vi.mock('@/services/contact/api/queries', () => ({
  GetContactsApi: vi.fn(),
  GetContactByIdApi: vi.fn(),
}));

vi.mock('@/services/contact/api/mutations', () => ({
  CreateContactApi: vi.fn(),
  DeleteContactApi: vi.fn(),
}));

// ─── Wrapper تست ──────────────────────────────────────────
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

// ─── تست‌ها ──────────────────────────────────────────────
describe('useContact hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetContacts', () => {
    it('should fetch contacts successfully', async () => {
      const mockContacts = [{ id: '1', name: 'John', email: 'john@example.com' }];
      (queries.GetContactsApi as any).mockResolvedValue(mockContacts);

      const { result } = renderHook(() => useGetContacts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockContacts);
      expect(queries.GetContactsApi).toHaveBeenCalledTimes(1);
    });

    it('should handle error', async () => {
      const error = new Error('Network error');
      (queries.GetContactsApi as any).mockRejectedValue(error);

      const { result } = renderHook(() => useGetContacts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useGetContact', () => {
    const id = '123';
    const mockContact = { id, name: 'John', email: 'john@example.com' };

    it('should fetch contact by id when id is provided', async () => {
      (queries.GetContactByIdApi as any).mockResolvedValue(mockContact);

      const { result } = renderHook(() => useGetContact(id), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockContact);
      expect(queries.GetContactByIdApi).toHaveBeenCalledWith(id);
    });

    it('should not fetch when id is falsy', () => {
      renderHook(() => useGetContact(''), { wrapper: createWrapper() });
      expect(queries.GetContactByIdApi).not.toHaveBeenCalled();
    });
  });

  describe('useCreateContact', () => {
    const input = {
      name: 'Jane',
      email: 'jane@example.com',
      phone: '09123456789',
      subject: 'Hello',
      message: 'This is a test message',
    };
    const createdContact = { id: 'c1', ...input, userId: null };

    it('should create contact and invalidate contacts query', async () => {
      (mutations.CreateContactApi as any).mockResolvedValue(createdContact);

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateContact(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(input);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // CreateContactApi فقط با یک آرگومان صدا زده می‌شود (بدون context)
      expect(mutations.CreateContactApi).toHaveBeenCalledWith(input);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: contactKeys.all });
    });
  });

  describe('useDeleteContact', () => {
    const id = 'c1';

    it('should delete contact and invalidate contacts query', async () => {
      (mutations.DeleteContactApi as any).mockResolvedValue({ success: true });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteContact(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      result.current.mutate(id);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // DeleteContactApi فقط با یک آرگومان صدا زده می‌شود (بدون context)
      expect(mutations.DeleteContactApi).toHaveBeenCalledWith(id);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: contactKeys.all });
    });
  });
});
