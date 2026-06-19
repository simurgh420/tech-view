import { dummyServices } from '@/components/sections/dummy/services';
import Image from 'next/image';

export function FeatureBar() {
  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {dummyServices.map(service => (
          <div key={service.id} className="flex flex-col items-center group">
            {/* باکس انعطاف‌پذیر و استاندارد */}
            <div
              className="
                flex items-center justify-center
                px-4 py-3
                rounded-xl
                bg-gray-200/70 dark:bg-gray-700/60
                backdrop-blur-sm
                transition-all duration-300
                group-hover:shadow-md group-hover:-translate-y-1
              "
            >
              <div className="relative w-24 h-10">
                <Image
                  src={service.icon}
                  alt={service.title}
                  fill
                  sizes="96px"
                  className="
                    object-contain
                    transition-transform duration-300
                    group-hover:scale-110
                  "
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
