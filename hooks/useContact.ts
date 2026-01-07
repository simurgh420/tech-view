'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGetContacts, apiGetContactById } from '@/services/contact/api/queries';
import { apiCreateContact, apiDeleteContact } from '@/services/contact/api/mutations';
import { ContactFormValues } from '@/lib/validation/contact.';

export function useContact() {
  const queryClient = useQueryClient();

  const useGetContacts = () =>
    useQuery({
      queryKey: ['contacts'],
      queryFn: apiGetContacts,
    });

  const useGetContact = (id: string) =>
    useQuery({
      queryKey: ['contact', id],
      queryFn: () => apiGetContactById(id),
      enabled: !!id,
    });

  const useCreateContact = () =>
    useMutation({
      mutationFn: (data: ContactFormValues) => apiCreateContact(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      },
    });

  const useDeleteContact = () =>
    useMutation({
      mutationFn: (id: string) => apiDeleteContact(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      },
    });

  return {
    useGetContacts,
    useGetContact,
    useCreateContact,
    useDeleteContact,
  };
}
