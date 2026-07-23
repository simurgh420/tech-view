'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SearchInput } from './SearchInput';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full " dir="rtl">
        <DialogHeader className="items-start text-right mt-2">
          <DialogTitle>جستجو</DialogTitle>
        </DialogHeader>

        <SearchInput />
      </DialogContent>
    </Dialog>
  );
}
