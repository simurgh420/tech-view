// components/sections/product-comments/ProductCommentItem.tsx

'use client';

import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { CommentNode } from '@/services/productComments/db/queries';

import { ProductCommentForm } from './ProductCommentForm';
import { DeleteProductCommentModal } from './DeleteProductCommentModal';

import { useSession } from '@/lib/auth-client';

interface ProductCommentItemProps {
  comment: CommentNode;
  productSlug: string;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('fa-IR');
}

export function ProductCommentItem({ comment, productSlug }: ProductCommentItemProps) {
  const { data: session } = useSession();

  const userId = session?.user?.id;

  const isOwner = Boolean(userId && comment.authorId === userId);

  const [isReplying, setIsReplying] = useState(false);

  return (
    <div>
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        {/* Avatar */}
        <Avatar
          className="
            h-8
            w-8
            shrink-0
          "
        >
          {!comment.isDeleted && comment.author?.image && (
            <AvatarImage src={comment.author.image} alt={comment.author.name ?? 'user'} />
          )}

          <AvatarFallback className="text-xs">
            {comment.isDeleted ? '—' : (comment.author?.name?.charAt(0) ?? '؟')}
          </AvatarFallback>
        </Avatar>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          {/* Header */}
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <p
              className="
                text-sm
                font-medium
              "
            >
              {comment.isDeleted ? 'کاربر' : (comment.author?.name ?? 'کاربر مهمان')}
            </p>

            <span
              className="
                text-xs
                text-muted-foreground
              "
            >
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p
            className={
              comment.isDeleted
                ? `
                  mt-1
                  text-sm
                  italic
                  text-muted-foreground
                `
                : `
                  mt-1
                  text-sm
                  leading-7
                  text-muted-foreground
                `
            }
          >
            {comment.content}
          </p>

          {!comment.isDeleted && (
            <div
              className="
                mt-1.5
                flex
                items-center
                gap-3
              "
            >
              {comment.canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="
                    h-auto
                    p-0

                    text-xs
                    text-muted-foreground

                    hover:text-foreground
                  "
                  onClick={() => setIsReplying(value => !value)}
                >
                  {isReplying ? 'بستن پاسخ' : 'پاسخ'}
                </Button>
              )}

              {isOwner && (
                <DeleteProductCommentModal commentId={comment.id} productSlug={productSlug} />
              )}
            </div>
          )}

          {isReplying && (
            <div className="mt-3">
              <ProductCommentForm
                productSlug={productSlug}
                parentId={comment.id}
                placeholder="پاسخ خود را بنویسید..."
                autoFocus
                onSuccess={() => setIsReplying(false)}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {(comment.replies?.length ?? 0) > 0 && (
        <div
          className="
            mr-4
            mt-4

            space-y-4

            border-r-2
            pr-4
          "
        >
          {comment.replies.map(reply => (
            <ProductCommentItem key={reply.id} comment={reply} productSlug={productSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
