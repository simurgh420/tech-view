// components/sections/auth/AuthLayout.tsx
import { ReactNode } from 'react';
import { AuthVisual } from './AuthVisual';

type Props = {
  children: ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen w-full bg-black" dir="rtl">
      {/* سمت راست: پنل بصری */}
      <div className="md:basis-3/5 lg:basis-2/3">
        <AuthVisual />
      </div>

      {/* سمت چپ: فرم */}
      <div className="relative flex w-full items-center justify-center overflow-hidden bg-black px-6 py-10 md:basis-2/5 lg:basis-1/3">
        {/* گرید ریز پس‌زمینه */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #00f0ff 1px, transparent 1px),
              linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* لوگوی موبایل */}
          <div className="mb-8 flex items-center justify-center gap-2 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-400/50 bg-black shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <span className="font-mono text-sm font-black text-cyan-400">TV</span>
            </div>
            <span className="font-mono text-xl font-bold tracking-widest text-white">
              TECH<span className="text-cyan-400">VIEW</span>
            </span>
          </div>

          {/* پنل شیشه‌ای اصلی */}
          <div className="relative rounded-2xl border border-cyan-400/20 bg-white/3 p-8 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-xl">
            {/* گوشه‌های HUD */}
            <div className="absolute -left-px -top-px h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-cyan-400" />
            <div className="absolute -bottom-px -right-px h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-fuchsia-400" />

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
