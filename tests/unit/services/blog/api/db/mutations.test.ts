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

vi.mock('@/services/upload/deleteImage', () => ({
  deleteImage: vi.fn(),
}));

describe('blog mutations', () => {
  it('createBlogPost calls prisma.blogPost.create with correct data', async () => {
    const mockData = { id: 1, title: 'Test Blog' };
     
    (prisma.blogPost.create as any).mockResolvedValue(mockData);

    const result = await createBlogPost({
      title: 'Test Blog',
      excerpt: 'This is a valid summary',
      content: 'This is a long content for reading minutes calculation',
      coverImageUrl: '/test.jpg',
      authorId: 'user_123',
      tags: ['tag1', 'tag2'],
    });

    expect(result).toEqual(mockData);
    expect(prisma.blogPost.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Test Blog',
          slug: toSlug('Test Blog'),
          excerpt: 'This is a valid summary',
          content: expect.any(String),
          coverImageUrl: '/test.jpg',
          authorId: 'user_123',
          status: 'PUBLISHED',
          tags: expect.any(Object),
        }),
      })
    );
  });

  it('updatePost updates post correctly', async () => {
    const mockPost = { id: 1, slug: 'test-slug' };

     
    (prisma.blogPost.findUnique as any).mockResolvedValue(mockPost);
     
    (prisma.blogPost.update as any).mockResolvedValue({ id: 1, title: 'Updated Blog' });

    const result = await updatePost('test-slug', {
      title: 'Updated Blog',
      excerpt: 'new excerpt',
      content: 'this is a long enough content for validation',
      coverImageUrl: '/image.jpg', // ❗ null ممنوع است
      tags: ['tag1'],
    });

    expect(prisma.tagOnPost.deleteMany).toHaveBeenCalledWith({
      where: { postId: mockPost.id },
    });

    expect(prisma.blogPost.update).toHaveBeenCalledWith({
      where: { slug: 'test-slug' },
      data: expect.objectContaining({
        title: 'Updated Blog',
        excerpt: 'new excerpt',
        content: 'this is a long enough content for validation',
        coverImageUrl: '/image.jpg',
        tags: expect.any(Object),
      }),
      include: expect.any(Object),
    });

    expect(result).toEqual({ id: 1, title: 'Updated Blog' });
  });

  it('deletePost deletes post when found', async () => {
    const mockPost = { id: 1, slug: 'test-slug', coverImageUrl: '/img.jpg' };

     
    (prisma.blogPost.findUnique as any).mockResolvedValue(mockPost);
     
    (prisma.blogPost.delete as any).mockResolvedValue({ success: true });

    const result = await deletePost('test-slug');

    expect(prisma.blogPost.findUnique).toHaveBeenCalledWith({
      where: { slug: 'test-slug' },
    });

    expect(prisma.blogPost.delete).toHaveBeenCalledWith({
      where: { slug: 'test-slug' },
    });

    expect(result).toEqual({ success: true });
  });
});
