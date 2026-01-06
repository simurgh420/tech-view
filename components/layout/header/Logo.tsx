import { ModeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';

export function Logo() {
  return (
    <div className="flex items-center justify-between w-full px-5">
      <Link href="/" className="text-xl font-bold text-primary px-5">
        TechView
      </Link>
      <ModeToggle />
    </div>
  );
}
