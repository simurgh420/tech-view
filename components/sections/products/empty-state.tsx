'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PackageOpen, WifiOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

type EmptyStateProps = {
  /** نوع نمایش: خالی (محصول پیدا نشد) یا خطا */
  variant?: 'empty' | 'error';
};

export function ProductEmptyState({ variant = 'empty' }: EmptyStateProps) {
  const isError = variant === 'error';

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white/70 px-8 pb-10 pt-12 text-center shadow-xl backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/70">
          {/* تزئین دایره‌ای */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-50/80 blur-3xl dark:bg-blue-900/20" />

          {/* آیکون مرکزی */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, delay: 0.1 }}
            className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            {isError ? (
              <WifiOff className="h-10 w-10 text-red-500" strokeWidth={1.5} />
            ) : (
              <PackageOpen className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
            )}
          </motion.div>

          {/* متن */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isError ? 'خطا در بارگذاری' : 'محصولی یافت نشد'}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isError
              ? 'متأسفانه نتونستیم محصولات رو دریافت کنیم. لطفاً دوباره تلاش کنید.'
              : 'همین الان می‌تونید محصول مورد نظر خودتون رو جستجو کنید.'}
          </p>

          {/* دکمه‌ها */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="sm" variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="ml-2 h-4 w-4" />
                صفحه محصولات
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
