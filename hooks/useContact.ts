'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ContactFormValues } from '@/lib/validation/contact';
import { GetContactByIdApi, GetContactsApi } from '@/services/contact/api/queries';
import { CreateContactApi, DeleteContactApi } from '@/services/contact/api/mutations';
import type { ContactMessage } from '@/app/generated/prisma/client';

export function useContact() {
  const qc = useQueryClient();

  const useGetContacts = () =>
    useQuery<ContactMessage[]>({
      queryKey: ['contacts'],
      queryFn: GetContactsApi,
    });

  const useGetContact = (id: string) =>
    useQuery<ContactMessage | null>({
      queryKey: ['contact', id],
      queryFn: () => GetContactByIdApi(id),
      enabled: !!id,
    });

  const useCreateContact = () =>
    useMutation<ContactMessage, Error, ContactFormValues>({
      mutationFn: data => CreateContactApi(data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['contacts'] });
      },
    });

  const useDeleteContact = () =>
    useMutation<{ success: boolean }, Error, string>({
      mutationFn: id => DeleteContactApi(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['contacts'] });
      },
    });

  return {
    useGetContacts,
    useGetContact,
    useCreateContact,
    useDeleteContact,
  };
}
