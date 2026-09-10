import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroText() {
  return (
    <div className="space-y-6 px-4 py-1 lg:px-6 animate-fade-in-up">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
        Tech View
      </h1>

      <p className="text-lg sm:text-2xl text-muted-foreground">
        Join the
        <span className="text-rose-500 font-semibold ml-2">digital revolution</span>
      </p>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button
          asChild
          size="lg"
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-6 rounded-md transition animate-fade-in"
        >
          <Link href="/products">Explore Products</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="border-rose-500/60 text-rose-400 hover:bg-rose-500/10 font-semibold px-8 py-6 rounded-md transition"
        >
          <Link href="/products?category=collection">View Collection</Link>
        </Button>
      </div>
    </div>
  );
}
