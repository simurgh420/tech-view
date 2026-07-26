'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ContactFormValues } from '@/lib/validation/contact';
import { GetContactByIdApi, GetContactsApi } from '@/services/contact/api/queries';
import { CreateContactApi, DeleteContactApi } from '@/services/contact/api/mutations';
import type { ContactMessage } from '@/app/generated/prisma/client';

/** کلیدهای کوئری متمرکز برای پیام‌های تماس */
export const contactKeys = {
  all: ['contacts'] as const,
  detail: (id: string) => ['contact', id] as const,
};

// ─────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────

/** لیست کامل پیام‌های تماس */
export function useGetContacts() {
  return useQuery<ContactMessage[]>({
    queryKey: contactKeys.all,
    queryFn: GetContactsApi,
  });
}

/** یک پیام تماس بر اساس شناسه */
export function useGetContact(id: string) {
  return useQuery<ContactMessage | null>({
    queryKey: contactKeys.detail(id),
    queryFn: () => GetContactByIdApi(id),
    enabled: !!id,
  });
}

// ─────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────

/** ثبت پیام تماس جدید */
export function useCreateContact() {
  const qc = useQueryClient();

  return useMutation<ContactMessage, Error, ContactFormValues>({
    mutationFn: data => CreateContactApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

/** حذف پیام تماس */
export function useDeleteContact() {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: id => DeleteContactApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}
