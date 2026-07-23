// components/sections/hero/HeroImage.tsx
'use client';

import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Link from 'next/link';

const slides = [
  {
    title: 'لپ‌تاپ‌ها',
    image: '/img/hero/hero-laptop.png',
    href: '/products/category/laptop',
  },
  {
    title: 'گوشی‌های هوشمند',
    image: '/img/hero/hero-phone.png',
    href: '/products/category/mobile',
  },
  {
    title: 'اسمارت‌ واچ‌ها',
    image: '/img/hero/hero-watch.png',
    href: '/products/category/smartwatch',
  },
];

export function HeroImage() {
  return (
    <div className="relative flex w-full min-w-0 items-center justify-center">
      <Carousel
        className="w-full max-w-182 min-w-0"
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: false,
          }),
        ]}
      >
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i}>
              <Link href={slide.href} className="group block">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  width={728}
                  height={443}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="h-auto w-full rounded-xl drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.03]"
                  priority={i === 0}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
