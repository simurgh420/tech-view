import { BlogForm } from '@/components/sections/blog/BlogForm';

export default function CreateBlogPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">✍️ ایجاد بلاگ جدید</h1>
      <BlogForm />
    </div>
  );
}
