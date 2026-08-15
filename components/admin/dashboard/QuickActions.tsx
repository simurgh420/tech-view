import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  FileText,
  FolderTree,
  Heart,
  Package,
  Tag,
  Users,
} from 'lucide-react';

const actions = [
  {
    href: '/admin/products',
    title: 'محصولات',
    description: 'مدیریت محصولات فروشگاه',
    icon: Package,
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },

  {
    href: '/admin/categories',
    title: 'دسته‌بندی‌ها',
    description: 'ساخت و مدیریت دسته‌بندی محصولات',
    icon: FolderTree,
    className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },

  {
    href: '/admin/brands',
    title: 'برندها',
    description: 'ساخت و مدیریت برندهای محصولات',
    icon: Tag,
    className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },

  {
    href: '/admin/dashboard/users',
    title: 'کاربران',
    description: 'مدیریت کاربران سیستم',
    icon: Users,
    className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },

  {
    href: '/admin/wishlist',
    title: 'علاقه‌مندی‌ها',
    description: 'مدیریت آیتم‌های ذخیره‌شده کاربران',
    icon: Heart,
    className: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },

  {
    href: '/admin/reports',
    title: 'گزارش‌ها',
    description: 'تحلیل کامل فروش و عملکرد',
    icon: BarChart3,
    className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },

  {
    href: '/admin/blogs',
    title: 'بلاگ',
    description: 'مدیریت نوشته‌ها و محتوا',
    icon: FileText,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
];

export function QuickActions() {
  return (
    <section className="rounded-2xl border p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">دسترسی سریع</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          دسترسی مستقیم به بخش‌های پرکاربرد مدیریت
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {actions.map(action => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-h-[150px] flex-col justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-xl p-2.5 ${action.className}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>

                <ArrowLeft
                  className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-6">
                <p className="font-semibold">{action.title}</p>

                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
