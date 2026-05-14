// types/blog.ts

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  readingMinutes: number;
  publishedAt: Date | null;
  authorId: string | null;
  author: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
};

export type BlogPostSafe = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  readingMinutes: number;
  publishedAt: Date | null;
  authorName: string | null;
  tags: string[];
};

export type BlogPostRecent = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date | null;
  coverImageUrl: string | null;
};

export type BlogListResponse = {
  items: BlogPostSafe[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};
