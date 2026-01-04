import { describe, it, expect, vi } from 'vitest';
import { createComment, updateComment, deleteComment } from '@/services/comments/db/mutations';

vi.mock('@/services/db/client', () => ({
  default: {
    comment: {
      create: vi.fn().mockResolvedValue({
        id: '1',
        content: 'تست',
        rating: 5,
        createdAt: new Date(),
        author: {
          id: 'user-1',
          name: 'Reza',
          image: 'https://example.com/avatar.png',
        },
      }),
      update: vi.fn().mockResolvedValue({
        id: '1',
        content: 'ویرایش شده',
        rating: 4,
        createdAt: new Date(),
        author: {
          id: 'user-1',
          name: 'Reza',
          image: 'https://example.com/avatar.png',
        },
      }),
      delete: vi.fn().mockResolvedValue({ id: '1' }),
    },
  },
}));

describe('Comment Mutations (mocked)', () => {
  it('should create a comment', async () => {
    const comment = await createComment({
      postId: 'fake-post-id',
      authorId: 'user-1',
      content: 'تست',
      rating: 5,
    });

    expect(comment.content).toBe('تست');
    expect(comment.rating).toBe(5);
    expect(comment.author?.name).toBe('Reza');
  });

  it('should update a comment', async () => {
    const updated = await updateComment('1', {
      content: 'ویرایش شده',
      rating: 4,
    });

    expect(updated.content).toBe('ویرایش شده');
    expect(updated.rating).toBe(4);
    expect(updated.author?.name).toBe('Reza');
  });

  it('should delete a comment', async () => {
    const deleted = await deleteComment('1');
    expect(deleted.id).toBe('1');
  });
});
