'use client';

import { useMegaMenuStore } from '@/stores/useMegaMenuStore';
import Image from 'next/image';
import Link from 'next/link';
import { categories } from '@/data/categories';
import { useState } from 'react';
export function MegaMenu() {
  const { isOpen, close } = useMegaMenuStore();
  const [activeCategory, setActiveCategory] = useState(categories[0]); // دسته فعال
  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        onClick={close}
      />
      <div
        onMouseLeave={close}
        className="absolute top-full left-1/2 -translate-x-1/2 z-50 border-t border-gray-200 bg-white shadow-2xl 
                   transition-all duration-300 ease-out transform animate-slideDown"
      >
        <div className=" w-5xl max-w-[1224px] h-[406px] mx-auto grid grid-cols-4 gap-8 p-6">
          {/* دسته‌بندی‌ها */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {categories.map(cat => (
                <li
                  key={cat.name}
                  onMouseEnter={() => setActiveCategory(cat)}
                  className="flex items-center cursor-pointer"
                >
                  <cat.icon className=" w-4 h-4 text-gray-500" />
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
          {/* زیرمنو و محصولات پیشنهادی */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-800">{activeCategory.name}</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeCategory.products.map(item => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="group flex flex-col items-center gap-2 hover:bg-gray-50 p-3 rounded transition"
                >
                  <div className="relative w-40 h-32 flex items-center justify-center">
                    <Image src={item.image} alt={item.title} fill className="object-contain" />
                  </div>
                  <div className="w-0 h-0.5 bg-transparent group-hover:w-20 group-hover:bg-blue-500 group-hover:shadow-blue-500/50 group-hover:shadow-lg transition-all duration-700 ease-in-out" />

                  <p className="text-xs text-gray-700 group-hover:text-blue-600 text-center">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
