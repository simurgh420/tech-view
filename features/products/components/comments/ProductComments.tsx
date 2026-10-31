// // components/sections/products/comments/ProductComments.tsx
// 'use client';

// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useQueryClient } from '@tanstack/react-query';
// import { useComments } from '@/hooks/useComments';

// const PAGE_SIZE = 5;

// type Props = {
//   productId: string;
//   rating: number;
//   ratingCount: number;
//   comments: ProductComment[];
// };

// export default function ProductComments({ productId, rating, ratingCount, comments }: Props) {
//   const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
//   const queryClient = useQueryClient();

//   const form = useForm<CommentFormValues>({ defaultValues: { rating: 0, title: '', body: '' } });
//   const addComment = useComments().useAddComment(productId);

//   const breakdown = [5, 4, 3, 2, 1].map(star => {
//     const count = comments.filter(c => c.rating === star).length;
//     return { star, percent: comments.length ? Math.round((count / comments.length) * 100) : 0 };
//   });

//   const onSubmit = (values: CommentFormValues) => {
//     addComment.mutate(
//       { ...values, productId },
//       {
//         onSuccess: () => {
//           form.reset();
//           queryClient.invalidateQueries({ queryKey: ['comments', productId] });
//         },
//       }
//     );
//   };

//   if (!comments.length && !ratingCount) {
//     return <p className="text-sm text-gray-500">هنوز نظری برای این محصول ثبت نشده است.</p>;
//   }

//   return (
//     <div className="space-y-6">
//       <RatingSummary rating={rating} ratingCount={ratingCount} breakdown={breakdown} />

//       <CommentForm form={form} onSubmit={onSubmit} isSubmitting={addComment.isPending} />

//       <div>
//         {comments.slice(0, visibleCount).map(comment => (
//           <CommentCard key={comment.id} comment={comment} />
//         ))}
//       </div>

//       {visibleCount < comments.length && (
//         <button
//           type="button"
//           onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
//           className="text-sm font-medium text-blue-600 hover:underline"
//         >
//           مشاهده نظرات بیشتر
//         </button>
//       )}
//     </div>
//   );
// }
