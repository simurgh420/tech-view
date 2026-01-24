// app/unauthorized/page.tsx
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center ">
      <div className=" shadow-lg rounded-lg p-8 text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold  mt-4">دسترسی غیرمجاز 🚫</h1>
        <p className=" mt-2">
          شما اجازه ورود به این صفحه رو ندارید برای اطلاعات بیشتر لطفا با ادمین تماس بگیرید
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-red-500  rounded-lg shadow hover:bg-red-600 transition"
        >
          صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
