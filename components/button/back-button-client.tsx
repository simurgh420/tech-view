'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

export function BackButtonClient({ label = 'بازگشت' }: { label?: string }) {
  const router = useRouter();

  return (
    <Button size="sm" variant="outline" className="gap-2" onClick={() => router.back()}>
      <ArrowLeftIcon className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
