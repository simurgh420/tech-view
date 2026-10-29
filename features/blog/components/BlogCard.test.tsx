// tests/unit/components/BlogCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { BlogPostSafe } from '@/features/blog/types/blog';
import { BlogCard } from './BlogCard';

// next/image را به یک img ساده mock می‌کنیم
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element -- Intentional test mock for next/image.
  default: ({ fill, alt = '', ...props }: any) => <img {...props} alt={alt} data-fill={fill ? 'true' : undefined} />,
}));

// next/link را به یک a ساده mock می‌کنیم
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const createPost = (
  overrides: Partial<Omit<BlogPostSafe, 'readingMinutes'>> & { readingMinutes?: number | null } = {},
): BlogPostSafe =>
  ({
    id: '1',
    slug: 'my-first-post',
    title: 'عنوان تستی مقاله',
    excerpt: 'خلاصه تستی مقاله',
    coverImageUrl: '/covers/test.png',
    readingMinutes: 5,
    publishedAt: '2025-03-21T10:00:00.000Z',
    ...overrides,
  }) as BlogPostSafe;

describe('BlogCard', () => {
  describe('محتوای اصلی', () => {
    it('should render title and excerpt', () => {
      render(<BlogCard post={createPost()} />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('عنوان تستی مقاله');
      expect(screen.getByText('خلاصه تستی مقاله')).toBeInTheDocument();
    });

    it('should link to the blog post page by slug', () => {
      render(<BlogCard post={createPost({ slug: 'hello-world' })} />);

      expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/hello-world');
    });

    it('should render static labels (TECH, Magazine, CTA)', () => {
      render(<BlogCard post={createPost()} />);

      expect(screen.getByText('TECH')).toBeInTheDocument();
      expect(screen.getByText('Magazine')).toBeInTheDocument();
      expect(screen.getByText('مطالعه مقاله')).toBeInTheDocument();
    });
  });

  describe('تصویر کاور', () => {
    it('should render cover image with post title as alt', () => {
      render(<BlogCard post={createPost({ coverImageUrl: '/covers/a.png' })} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/covers/a.png');
      expect(img).toHaveAttribute('alt', 'عنوان تستی مقاله');
    });

    it('should fallback to placeholder when coverImageUrl is null', () => {
      render(<BlogCard post={createPost({ coverImageUrl: null })} />);

      expect(screen.getByRole('img')).toHaveAttribute('src', '/Image-not-found.png');
    });

    it('should fallback to placeholder when coverImageUrl is empty string', () => {
      render(<BlogCard post={createPost({ coverImageUrl: '' })} />);

      expect(screen.getByRole('img')).toHaveAttribute('src', '/Image-not-found.png');
    });
  });

  describe('زمان مطالعه', () => {
    it('should render reading minutes when provided', () => {
      render(<BlogCard post={createPost({ readingMinutes: 7 })} />);

      expect(screen.getByText(/7 دقیقه/)).toBeInTheDocument();
    });

    it('should not render reading minutes when null', () => {
      render(<BlogCard post={createPost({ readingMinutes: null })} />);

      expect(screen.queryByText(/دقیقه/)).not.toBeInTheDocument();
    });

    it('should not render reading minutes when 0', () => {
      render(<BlogCard post={createPost({ readingMinutes: 0 })} />);

      // نکته: با `&&` مقدار 0 ممکن است خود عدد "0" را در DOM چاپ کند
      expect(screen.queryByText(/دقیقه/)).not.toBeInTheDocument();
    });
  });

  describe('تاریخ انتشار', () => {
    it('should render formatted Persian date when publishedAt is provided', () => {
      render(<BlogCard post={createPost({ publishedAt: new Date('2025-03-21T10:00:00.000Z') })} />);

      const expected = new Date('2025-03-21T10:00:00.000Z').toLocaleDateString('fa-IR-u-nu-latn');
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('should not render date when publishedAt is null', () => {
      render(<BlogCard post={createPost({ publishedAt: null })} />);

      const container = screen.getByRole('link');
      // فقط یک span (زمان مطالعه) باید باشد، نه دو تا
      expect(container.querySelectorAll('span.flex.items-center')).toHaveLength(1);
    });
  });
});
