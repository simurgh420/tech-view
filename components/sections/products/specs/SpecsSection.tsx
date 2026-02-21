// components/product/specs/SpecsSection.tsx
'use client';

import { useState } from 'react';
import SpecsRow from './SpecsRow';
import { ChevronDown } from 'lucide-react';

type Props = {
  title: string;
  items: { label: string; value: string | number }[];
};

export default function SpecsSection({ title, items }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800"
      >
        <span className="font-semibold text-gray-800 dark:text-gray-200">{title}</span>

        <ChevronDown className={`transition-transform ${open ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {/* Content */}
      {open && (
        <div className="divide-y">
          {items.map((item, i) => (
            <SpecsRow key={i} label={item.label} value={item.value} />
          ))}
        </div>
      )}
    </div>
  );
}
