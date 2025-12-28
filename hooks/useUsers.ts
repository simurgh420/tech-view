// hooks/useUsers.ts

import { fetchUserById, fetchUsers } from '@/services/users/api/queries';
import { createUser, deleteUser, updateUser } from '@/services/users/db/mutations';
import { User, UserPayload } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useUsers() {
  const queryClient = useQueryClient();
  const useGetUsers = () =>
    useQuery<User[]>({
      queryKey: ['users'],
      queryFn: fetchUsers,
    });
  const useGetUser = (id: string) =>
    useQuery<User>({
      queryKey: ['user', id],
      queryFn: () => fetchUserById(id),
      enabled: !!id,
    });
  const useCreateUser = () =>
    useMutation({
      mutationFn: (payload: UserPayload) => createUser(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
  const useUpdateUser = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<UserPayload> }) =>
        updateUser(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['user', id] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    });
  const useDeleteUser = () =>
    useMutation({
      mutationFn: (id: string) => deleteUser(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
  return {
    useGetUsers,
    useGetUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
  };
}
