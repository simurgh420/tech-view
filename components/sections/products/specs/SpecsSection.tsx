'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SpecsRow from './SpecsRow';

type Props = {
  title: string;
  items: {
    label: string;
    value: string | number;
  }[];
};

export default function SpecsSection({ title, items }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-neutral-200/70
        bg-white
        shadow-sm
        transition-all
        duration-300
        dark:border-neutral-800/70
        dark:bg-[#15181D]
      "
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          flex
          w-full
          items-center
          justify-between
          px-5
          py-4
          transition-colors
          duration-200
          hover:bg-neutral-50
          dark:hover:bg-white/[0.03]
        "
      >
        <span
          className="
            text-base
            font-semibold
            text-neutral-900
            dark:text-neutral-100
          "
        >
          {title}
        </span>

        <ChevronDown
          size={18}
          className={`
            text-neutral-500
            transition-transform
            duration-300
            dark:text-neutral-400
            ${open ? 'rotate-180' : ''}
          `}
        />
      </button>

      {open && (
        <div>
          {items.map(item => (
            <SpecsRow key={`${item.label}-${item.value}`} label={item.label} value={item.value} />
          ))}
        </div>
      )}
    </section>
  );
}
