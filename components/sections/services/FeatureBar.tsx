import { dummyServices } from '@/components/sections/dummy/services';
import Image from 'next/image';
export function FeatureBar() {
  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
        {dummyServices.map(service => (
          <div key={service.id} className="flex flex-col items-center gap-3">
            <div className="relative w-40 h-12 transform group-hover:scale-110 transition-transform duration-300">
              <Image src={service.icon} alt={service.title} fill className="object-contain" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
