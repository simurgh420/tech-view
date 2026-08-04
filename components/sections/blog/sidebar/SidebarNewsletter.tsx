import { Mail } from 'lucide-react';

import { SidebarCard } from './SidebarCard';

export function SidebarNewsletter() {
  return (
    <SidebarCard title="خبرنامه" icon={<Mail size={18} />}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          جدیدترین مقالات تکنولوژی، بررسی سخت‌افزار و اخبار دنیای برنامه‌نویسی را مستقیم دریافت
          کنید.
        </p>

        <form className="space-y-3">
          <input
            type="email"
            placeholder="ایمیل شما"
            className="
              h-11
              w-full
              rounded-xl
              border
              border-border
              bg-background
              px-4
              text-sm
              text-foreground
              outline-none
              transition-all
              placeholder:text-muted-foreground
              focus:border-primary
              focus:ring-2
              focus:ring-primary/20
            "
          />

          <button
            type="submit"
            className="
              h-11
              w-full
              rounded-xl
              bg-primary
              text-sm
              font-semibold
              text-primary-foreground
              transition-all
              duration-300
              hover:opacity-90
            "
          >
            عضویت در خبرنامه
          </button>
        </form>
      </div>
    </SidebarCard>
  );
}
