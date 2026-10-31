// src/components/blog/sidebar/SidebarCard.tsx

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SidebarCardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SidebarCard({ title, icon, children, className }: SidebarCardProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-border shadow-sm transition-all duration-300 hover:shadow-lg',
        className
      )}
    >
      <header className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>

        <h2 className="text-sm font-bold tracking-wide text-foreground">{title}</h2>
      </header>

      <div className="p-6">{children}</div>
    </section>
  );
}
