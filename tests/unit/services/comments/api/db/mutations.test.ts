import { describe, it, expect, vi } from 'vitest';
import {
  createComment,
  updateComment,
  likeComment,
  dislikeComment,
  deleteComment,
} from '@/services/comments/db/mutations';
vi.mock('@/services/db/client', () => ({
  default: {
    comment: {
      create: vi.fn().mockResolvedValue({
        id: '1',
        content: 'تست',
        author: 'reza',
        rating: 5,
        likes: 0,
        dislikes: 0,
        createdAt: new Date(),
      }),
      update: vi.fn().mockResolvedValue({
        id: '1',
        content: 'ویرایش شده',
        author: 'reza',
        rating: 4,
        likes: 1,
        dislikes: 1,
        createdAt: new Date(),
      }),
      delete: vi.fn().mockResolvedValue({ id: '1' }),
    },
  },
}));
describe('Comment Mutations (mocked)', () => {
  it('should create a comment', async () => {
    const comment = await createComment('fake-post-id', 'reza', 'تست');
    expect(comment.author).toBe('reza');
    expect(comment.content).toBe('تست');
  });
  it('should update a comment', async () => {
    const updated = await updateComment('1', { content: 'ویرایش شده', rating: 4 });
    expect(updated.content).toBe('ویرایش شده');
    expect(updated.rating).toBe(4);
  });
  it('should like a comment', async () => {
    const liked = await likeComment('1');
    expect(liked.likes).toBe(1);
  });
  it('should dislike a comment', async () => {
    const disliked = await dislikeComment('1');
    expect(disliked.dislikes).toBe(1);
  });
  it('should delete a comment', async () => {
    const deleted = await deleteComment('1');
    expect(deleted.id).toBe('1');
  });
});
