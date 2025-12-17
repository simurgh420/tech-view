import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // برای تست کامپوننت‌های React
    globals: true, // اجازه استفاده از describe, it, expect بدون import
    setupFiles: ['./tests/setupTests.ts'], // فایل آماده‌سازی
    include: ['tests/**/*.{test,spec}.{ts,tsx}'], // مسیر تست‌ها
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
