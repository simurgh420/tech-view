'use client';

import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { ReturnButton } from '@/components/button/return-button';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function UnauthorizedClient() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <div
          className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 
                     bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl shadow-2xl 
                     before:absolute before:inset-0 before:-z-10 before:bg-linear-to-br 
                     before:from-orange-50 before:to-red-50 dark:before:from-orange-950/40 dark:before:to-red-950/30"
        >
          {/* تزئینات دایره‌ای */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-orange-100/60 dark:bg-orange-900/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-red-100/60 dark:bg-red-900/30 blur-3xl" />

          <div className="relative flex flex-col items-center px-8 pb-10 pt-12 text-center">
            {/* آیکون مرکزی */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mb-8 flex h-24 w-24 items-center justify-center rounded-full 
                         bg-orange-50 dark:bg-orange-950/80 shadow-inner"
            >
              <ShieldAlert
                className="h-12 w-12 text-orange-600 dark:text-orange-400"
                strokeWidth={1.5}
              />
            </motion.div>

            {/* متن خطا */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                دسترسی غیرمجاز 🚫
              </h1>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                شما اجازه ورود به این صفحه را ندارید. <br />
                برای اطلاعات بیشتر با ادمین تماس بگیرید.
              </p>
            </motion.div>

            {/* دکمه‌های عملیات */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <ReturnButton useBack label="بازگشت" />

              <Button size="sm" variant="destructive" asChild>
                <Link href="/">صفحه اصلی</Link>
              </Button>
            </motion.div>
          </div>

          {/* پاورقی مینیمال */}
          <div className="border-t border-gray-100 dark:border-gray-800/80 px-8 py-3 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              اگر مشکل ادامه داشت، با پشتیبانی تماس بگیرید.
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
