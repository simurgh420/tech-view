import Link from 'next/link';
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="text-xs font-black">TV</span>
      </div>
      <span className="text-lg font-bold text-foreground">
        Tech<span className="text-primary">View</span>
      </span>
    </Link>
  );
}
