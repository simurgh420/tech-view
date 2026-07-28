import { Prisma } from '@/app/generated/prisma/client';
import { commentInclude } from '@/services/productComments/constants';

export interface CommentNode {
  id: string;
  content: string;
  productId: string;
  authorId: string | null;
  parentId: string | null;
  depth: number;
  status: string;
  isDeleted: boolean;
  canReply: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  replies: CommentNode[];
}

export type ProductCommentWithAuthor = Prisma.ProductCommentGetPayload<{
  include: typeof commentInclude;
}>;
