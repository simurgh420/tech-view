import { HeroImage } from './HeroImage';
import { HeroText } from './HeroText';

export function HeroSection() {
  return (
    <section className="w-full py-10 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 md:gap-12">
        <HeroText />
        <HeroImage />
      </div>
    </section>
  );
}
