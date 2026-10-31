'use client';

import { Search } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { SearchInput } from './SearchInput';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        dir="rtl"
        className="
          w-full
          max-w-2xl

          overflow-hidden

          rounded-3xl

          border
          border-border/70

          bg-background

          p-2

          shadow-2xl
        "
      >
        <DialogHeader
          className="
            border-b

            px-6
            py-5
          "
        >
          <DialogTitle
            className="
              flex
              items-center
              gap-2

              text-lg
              font-bold
            "
          >
            <Search className="h-5 w-5 text-primary" />
            جستجو
          </DialogTitle>

          <p className="text-sm text-muted-foreground text-right">
            محصول، مقاله یا دسته‌بندی موردنظر خود را جستجو کنید.
          </p>
        </DialogHeader>

        <div className="p-6">
          <SearchInput />
        </div>
      </DialogContent>
    </Dialog>
  );
}
