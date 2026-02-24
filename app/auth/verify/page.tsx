// app/auth/verify/page.tsx
import { CheckCircleIcon } from 'lucide-react';
import Link from 'next/link';

export default function AuthVerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center ">
      <div className=" shadow-lg rounded-lg p-8 text-center max-w-md">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold  mt-4">تأیید با موفقیت انجام شد 🎉</h1>
        <p className="text-gray-600 mt-2">حساب کاربری شما فعال شد و می‌توانید وارد شوید.</p>
        <Link
          href="/profile"
          className="mt-6 inline-block px-6 py-2 bg-green-500  rounded-lg shadow hover:bg-green-600 transition"
        >
          رفتن به پروفایل
        </Link>
      </div>
    </div>
  );
}
