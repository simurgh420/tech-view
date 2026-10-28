// types/comment.ts

export type CommentSafe = {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;

  authorName: string | null;
  authorImage: string | null;
};

export type AdminComment = {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  author: {
    name: string | null;
    image: string | null;
  } | null;
  post: {
    id: string;
    slug: string;
    title: string;
  } | null;
};
