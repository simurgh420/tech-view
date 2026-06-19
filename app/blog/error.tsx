'use client';

import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { ReturnButton } from '@/components/button/return-button';
import { useRouter } from 'next/navigation';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRetry = useCallback(() => {
    if (reset) {
      reset();
    } else {
      router.refresh();
    }
  }, [reset, router]);
  return (
    <main className="flex min-h-[80vh] items-center justify-center p-4">
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
                     before:from-red-50 before:to-orange-50 dark:before:from-red-950/40 dark:before:to-orange-950/30"
        >
          {/* دیزاین انتزاعی بالای کارت */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-red-100/60 dark:bg-red-900/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-orange-100/60 dark:bg-orange-900/30 blur-3xl" />

          <div className="relative flex flex-col items-center px-8 pb-10 pt-12 text-center">
            {/* آیکون مرکزی */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mb-8 flex h-24 w-24 items-center justify-center rounded-full 
                         bg-red-50 dark:bg-red-950/80 shadow-inner"
            >
              <WifiOff className="h-12 w-12 text-red-500" strokeWidth={1.5} />
            </motion.div>

            {/* متن خطا */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                خطا در بارگذاری بلاگ
              </h1>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                متأسفانه نتونستیم بلاگ‌ها رو دریافت کنیم. <br />
                ممکنه مشکل از قطعی اینترنت یا سرویس‌دهنده باشه.
              </p>

              {/* جزییات خطا برای کاربران فنی (اختیاری) */}
              {error.digest && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-900 px-3 py-1 text-xs text-gray-500">
                  <AlertTriangle className="h-3 w-3" />
                  <code>digest: {error.digest}</code>
                </div>
              )}
            </motion.div>

            {/* دکمه‌های عملیات */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <button
                type="button"
                onClick={handleRetry}
                className="group inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 
                           text-sm font-semibold text-white shadow-lg shadow-red-200 
                           transition duration-200 hover:bg-red-700 hover:shadow-red-300 
                           active:scale-95 dark:shadow-red-900/50"
              >
                <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                تلاش مجدد
              </button>

              <ReturnButton href="/" label="برو به خانه" />
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
