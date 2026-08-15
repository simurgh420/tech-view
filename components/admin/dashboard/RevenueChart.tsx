'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type RevenueChartProps = {
  data: {
    date: string;
    revenue: number;
  }[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
      <p className="mb-1 text-xs text-muted-foreground">{label ? formatDate(label) : ''}</p>

      <p className="font-semibold">{formatNumber(payload[0].value)} تومان</p>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div
      className="relative h-80 w-full overflow-hidden rounded-xl border border-dashed bg-muted/10"
      title="داده‌ای برای نمایش وجود ندارد"
    >
      {/* Decorative empty chart */}
      <div className="absolute inset-0 p-6 opacity-40">
        <div className="relative h-full w-full">
          {/* Horizontal grid lines */}
          <div className="absolute inset-x-0 top-[20%] border-t border-dashed border-border" />
          <div className="absolute inset-x-0 top-[40%] border-t border-dashed border-border" />
          <div className="absolute inset-x-0 top-[60%] border-t border-dashed border-border" />
          <div className="absolute inset-x-0 top-[80%] border-t border-dashed border-border" />

          {/* Fake chart line */}
          <svg
            viewBox="0 0 600 220"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 170 C80 145, 120 160, 180 125 S280 110, 340 130 S460 90, 600 105"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 8"
              className="text-primary/20"
            />

            <path
              d="M0 170 C80 145, 120 160, 180 125 S280 110, 340 130 S460 90, 600 105"
              fill="url(#emptyGradient)"
              className="text-primary/5"
            />

            <defs>
              <linearGradient id="emptyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Center message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-2xl border bg-background/90 px-6 py-5 text-center shadow-sm backdrop-blur">
          <p className="text-sm font-medium">داده‌ای برای نمایش وجود ندارد</p>

          <p className="mt-1 text-xs text-muted-foreground">
            با ثبت سفارش‌های جدید، نمودار فروش در اینجا نمایش داده می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasData = data.some(item => item.revenue > 0);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">فروش</h2>

          <p className="mt-1 text-sm text-muted-foreground">عملکرد فروش در ۳۰ روز اخیر</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyChartState />
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />

                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border" />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
                minTickGap={28}
                className="text-xs"
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={formatNumber}
                width={75}
                className="text-xs"
              />

              <Tooltip
                cursor={{
                  stroke: 'var(--border)',
                }}
                content={<CustomTooltip />}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
