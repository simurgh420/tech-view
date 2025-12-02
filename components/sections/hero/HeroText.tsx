import { Button } from '@/components/ui';

export function HeroText() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-5xl font-medium leading-tight">Tech View</h1>
      <p className="text-lg sm:text-xl">
        Join the
        <span className="text-orange-400 font-semibold ml-2">digital revolution</span>
      </p>
      <Button variant={'orange-filled'} className="font-medium px-6 py-3 rounded-md transition">
        Explore More
      </Button>
    </div>
  );
}
