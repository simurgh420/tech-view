import { HeroImage } from './HeroImage';
import { HeroText } from './HeroText';

export function HeroSection() {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        <HeroText />
        <HeroImage />
      </div>
    </section>
  );
}
