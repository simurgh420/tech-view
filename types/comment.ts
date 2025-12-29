export type CommentSafe = {
  id: string;
  content: string;
  rating: number;
  avatar?: string | null;
  author: string;
  createdAt: Date;
};
