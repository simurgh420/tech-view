'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/auth/login', label: 'ورود' },
  { href: '/auth/register', label: 'ثبت‌نام' },
];

export function AuthTabs() {
  const pathname = usePathname();

  return (
    <div className="relative mb-8 flex rounded-xl border border-white/10 bg-white/3 p-1">
      {tabs.map(tab => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition-colors"
          >
            {isActive && (
              <motion.span
                layoutId="auth-tab-pill"
                className="absolute inset-0 rounded-lg border border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${isActive ? 'text-cyan-300' : 'text-white/50 hover:text-white/80'}`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
