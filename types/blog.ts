// types/blog.ts
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  readingMinutes: number;
  publishedAt: Date;
  author: string;
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
};

export type BlogPostRecent = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  coverImageUrl: string;
};
export type BlogListResponse = {
  items: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};
