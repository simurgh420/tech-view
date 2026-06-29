import { Button } from '@/components/ui/button';

export function HeroText() {
  return (
    <div className="space-y-4 px-4 py-1 lg:px-6 animate-fade-in-up">
      <h1 className="text-2xl sm:text-5xl font-medium leading-tight">Tech View</h1>

      <p className="text-lg sm:text-xl">
        Join the
        <span className="text-orange-400 font-semibold ml-2">digital revolution</span>
      </p>

      <Button
        variant="link"
        className="font-medium px-6 py-3 rounded-md transition animate-fade-in"
      >
        Explore More
      </Button>
    </div>
  );
}
