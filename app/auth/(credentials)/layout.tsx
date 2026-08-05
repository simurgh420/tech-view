import { ReactNode } from 'react';
import { AuthVisual } from '@/components/sections/auth/AuthVisual';
import { AuthTabs } from '@/components/sections/auth/AuthTabs';
import { AuthPageTransition } from '@/components/sections/auth/AuthPageTransition';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <AuthVisual />

      <div className="relative z-10 w-full max-w-md">
        <div className="relative rounded-2xl border border-cyan-400/20 bg-black/50 p-8 shadow-[0_0_50px_rgba(34,211,238,0.1)] backdrop-blur-2xl">
          {/* گوشه‌های HUD */}
          <div className="absolute -left-px -top-px h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-cyan-400" />
          <div className="absolute -bottom-px -right-px h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-fuchsia-400" />

          <AuthTabs />
          <AuthPageTransition>{children}</AuthPageTransition>
        </div>
      </div>
    </div>
  );
}
