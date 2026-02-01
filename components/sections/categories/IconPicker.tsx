'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Shirt, Phone, Book, Laptop, Camera } from 'lucide-react'; // فقط آیکون‌های مورد نیاز

type IconPickerProps = {
  value?: string | null;
  onChange: (val: string) => void;
};

// لیست آیکون‌های مجاز
const availableIcons = [
  { name: 'Shirt', Icon: Shirt },
  { name: 'Phone', Icon: Phone },
  { name: 'Book', Icon: Book },
  { name: 'Laptop', Icon: Laptop },
  { name: 'Camera', Icon: Camera },
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filteredIcons = availableIcons.filter(icon =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = value ? availableIcons.find(icon => icon.name === value)?.Icon : null;

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {SelectedIcon && <SelectedIcon size={18} />}
            <span>{value || 'انتخاب آیکون'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3">
          <Input
            placeholder="جستجو آیکون..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-3"
          />
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {filteredIcons.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name)}
                className="flex flex-col items-center p-2 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Icon size={20} />
                <span className="text-xs truncate">{name}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
