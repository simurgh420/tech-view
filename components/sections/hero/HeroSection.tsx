import { HeroImage } from './HeroImage';
import { HeroText } from './HeroText';

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden py-10 md:py-20">
      {/* Glow Background - هماهنگ با برندینگ قرمز/صورتی سایت */}
      <div
        className="
          pointer-events-none absolute left-1/2 top-1/2
          h-125 w-125 -translate-x-1/2 -translate-y-1/2
          rounded-full
          bg-linear-to-br from-rose-600/40 via-pink-600/25 to-red-700/30
          blur-[120px]
          animate-pulse-slow
        "
      />

      <div className="relative z-10 grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-12">
        <div className="min-w-0">
          <HeroText />
        </div>
        <div className="min-w-0">
          <HeroImage />
        </div>
      </div>
    </section>
  );
}
