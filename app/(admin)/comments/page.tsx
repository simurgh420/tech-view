import { CommentsList } from '@/components/sections/comments/CommentsList';

export default function CommentsPage() {
  return (
    <div className="container mx-auto py-10" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">مدیریت کامنت‌ها</h1>
      </div>

      <CommentsList />
    </div>
  );
}
