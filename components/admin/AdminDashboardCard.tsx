import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';

type AdminDashboardCardProps = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
};

export function AdminDashboardCard({
  href,
  title,
  description,
  icon: Icon,
  iconClassName,
}: AdminDashboardCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border bg-background p-6 shadow-md transition-all hover:shadow-lg"
    >
      <div className="rounded-xl p-3 transition-colors">
        <Icon className={`size-6 ${iconClassName ?? ''}`} aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
