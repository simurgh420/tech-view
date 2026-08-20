import Link from 'next/link';
import { ArrowLeft, Clock3 } from 'lucide-react';

type RecentOrdersProps = {
  orders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    userName: string;
  }[];
};

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('en-US').format(value)} تومان`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: 'در انتظار',
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  },

  PAID: {
    label: 'پرداخت شده',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },

  SHIPPED: {
    label: 'ارسال شده',
    className: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  },

  DELIVERED: {
    label: 'تحویل شده',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },

  CANCELLED: {
    label: 'لغو شده',
    className: 'bg-red-500/10 text-red-700 dark:text-red-400',
  },
};

function getStatus(status: string) {
  return (
    statusConfig[status] ?? {
      label: status,
      className: 'bg-muted text-muted-foreground',
    }
  );
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="rounded-2xl border  p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">سفارش‌های اخیر</h2>

          <p className="mt-1 text-sm text-muted-foreground">آخرین سفارش‌های ثبت‌شده</p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          مشاهده همه
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed text-center">
            <Clock3 className="mb-3 size-8 text-muted-foreground" />

            <p className="font-medium">هنوز سفارشی ثبت نشده است</p>

            <p className="mt-1 text-sm text-muted-foreground">
              سفارش‌های جدید در اینجا نمایش داده می‌شوند.
            </p>
          </div>
        ) : (
          orders.map(order => {
            const status = getStatus(order.status);

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-xl border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{order.userName}</p>

                    <p className="mt-1 text-xs text-muted-foreground">#{order.id}</p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{formatCurrency(order.total)}</span>

                  <span className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
