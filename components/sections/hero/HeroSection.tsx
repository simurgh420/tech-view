// components/sections/hero/HeroSection.tsx
import { HeroImage } from './HeroImage';
import { HeroText } from './HeroText';

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden py-10 md:py-20">
      {/* Glow Background - پشت کل هیرو (متن + عکس) */}
      <div
        className="
          pointer-events-none absolute left-1/2 top-1/2
          h-125 w-125 -translate-x-1/2 -translate-y-1/2
          rounded-full
          bg-linear-to-br from-purple-600/40 via-blue-600/30 to-indigo-700/40
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
