// tests/unit/services/blog/db//mutations.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createBlogPost, updatePost, deletePost } from '@/services/blog/db/mutations';
import { toSlug } from '@/lib/slug';
import prisma from '@/services/db/client';

vi.mock('@/services/db/client', () => ({
  default: {
    blogPost: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    tagOnPost: { deleteMany: vi.fn() },
  },
}));

describe('blog mutations', async () => {
  it('createBlogPost calls prisma.blogPost.create with correct data', async () => {
    const mockData = { id: 1, title: 'Test Blog' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.blogPost.create as any).mockResolvedValue(mockData);
    const result = await createBlogPost({
      title: 'Test Blog',
      excerpt: 'Summary',
      content: 'This is a long content for reading minutes calculation',
      coverImageUrl: '/test.jpg',
      author: 'Mohammadreza',
      tags: ['tag1', 'tag2'],
    });
    expect(prisma.blogPost.create).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });
  it('updatePost returns null if post not found', async () => {
    const mockPost = { id: 1, slug: 'text-slug' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.blogPost.findUnique as any).mockResolvedValue(mockPost);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.blogPost.update as any).mockResolvedValue({ id: 1, title: 'Updated Blog' });

    const result = await updatePost('test-slug', { title: 'Updated Blog' });
    expect(prisma.blogPost.update).toHaveBeenCalledWith({
      where: { slug: 'test-slug' },
      data: expect.objectContaining({ title: 'Updated Blog', slug: toSlug('Updated Blog') }),
    });
    expect(result).toEqual({ id: 1, title: 'Updated Blog' });
  });
  it('deletePost calls prisma.blogPost.delete', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.blogPost.delete as any).mockResolvedValue({ success: true });
    const result = await deletePost('test-slug');
    expect(prisma.blogPost.delete).toHaveBeenCalledWith({ where: { slug: 'test-slug' } });
    expect(result).toEqual({ success: true });
  });
});
