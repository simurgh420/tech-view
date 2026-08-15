import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

type DashboardStatsProps = {
  stats: {
    revenue: number;
    revenueGrowth: number;
    orders: number;
    ordersGrowth: number;
    users: number;
    usersGrowth: number;
    products: number;
  };
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('en-US').format(value)} تومان`;
}

function formatGrowth(value: number) {
  const sign = value > 0 ? '+' : '';

  return `${sign}${value.toFixed(1)}%`;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: 'فروش',
      value: formatCurrency(stats.revenue),
      growth: stats.revenueGrowth,
      icon: TrendingUp,
      description: 'نسبت به ۳۰ روز قبل',
      iconClassName: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    {
      title: 'سفارش‌ها',
      value: formatNumber(stats.orders),
      growth: stats.ordersGrowth,
      description: 'نسبت به ۳۰ روز قبل',
      icon: ShoppingCart,
      iconClassName: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'کاربران',
      value: formatNumber(stats.users),
      growth: stats.usersGrowth,
      description: 'کاربر جدید در ۳۰ روز',
      icon: Users,
      iconClassName: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
    {
      title: 'محصولات',
      value: formatNumber(stats.products),
      growth: null,
      description: 'محصول منتشرشده',
      icon: Package,
      iconClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <section aria-label="آمار اصلی" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(card => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>

                <p className="mt-2 text-2xl font-bold tracking-tight">{card.value}</p>
              </div>

              <div className={`rounded-xl p-3 ${card.iconClassName}`}>
                <Icon className="size-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
              {card.growth !== null ? (
                <span
                  className={
                    card.growth >= 0
                      ? 'font-medium text-emerald-600 dark:text-emerald-400'
                      : 'font-medium text-red-600 dark:text-red-400'
                  }
                >
                  {formatGrowth(card.growth)}
                </span>
              ) : (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">فعال</span>
              )}

              <span className="text-muted-foreground">{card.description}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
