// types/comment.ts

export type CommentSafe = {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;

  authorName: string | null;
  authorImage: string | null;
};
