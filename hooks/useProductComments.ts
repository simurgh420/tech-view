// hooks/useProductComments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CommentNode } from '@/services/productComments/db/queries';
import {
  CreateProductCommentInput,
  UpdateProductCommentInput,
} from '@/lib/validation/productComment';
import {
  createCommentApi,
  deleteCommentApi,
  updateCommentApi,
} from '@/services/productComments/api/mutations';
import { fetchCommentsByProductApi } from '@/services/productComments/api/queries';

export function useProductComments(slug: string) {
  const qc = useQueryClient();

  const useGetComments = () =>
    useQuery<CommentNode[]>({
      queryKey: ['product-comments', slug],
      queryFn: () => fetchCommentsByProductApi(slug),
      enabled: !!slug,
    });

  const useCreateComment = () =>
    useMutation({
      mutationFn: (payload: CreateProductCommentInput) => createCommentApi(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['product-comments', slug] }),
    });

  const useUpdateComment = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateProductCommentInput }) =>
        updateCommentApi(id, data),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['product-comments', slug] }),
    });

  const useDeleteComment = () =>
    useMutation({
      mutationFn: (id: string) => deleteCommentApi(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['product-comments', slug] }),
    });

  return { useGetComments, useCreateComment, useUpdateComment, useDeleteComment };
}
