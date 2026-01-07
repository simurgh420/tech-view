import { dummyServices } from '@/components/sections/dummy/services';
import Image from 'next/image';

export function FeatureBar() {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
        {dummyServices.map(service => (
          <div key={service.id} className="flex flex-col items-center gap-3 group">
            <div className="relative w-40 h-12">
              <Image
                src={service.icon}
                alt={service.title}
                fill
                className="
                  object-contain
                  drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]
                  dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.25)]
                  transition-transform duration-300 group-hover:scale-110
                "
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
