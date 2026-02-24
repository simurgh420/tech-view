'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ContactFormValues } from '@/lib/validation/contact.';
import { GetContactByIdApi, GetContactsApi } from '@/services/contact/api/queries';
import { CreateContactApi, DeleteContactApi } from '@/services/contact/api/mutations';

export function useContact() {
  const qc = useQueryClient();

  const useGetContacts = () =>
    useQuery({
      queryKey: ['contacts'],
      queryFn: GetContactsApi,
    });

  const useGetContact = (id: string) =>
    useQuery({
      queryKey: ['contact', id],
      queryFn: () => GetContactByIdApi(id),
      enabled: !!id,
    });

  const useCreateContact = () =>
    useMutation({
      mutationFn: (data: ContactFormValues) => CreateContactApi(data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['contacts'] });
      },
    });

  const useDeleteContact = () =>
    useMutation({
      mutationFn: (id: string) => DeleteContactApi(id),
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
